import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/server/recipe-generation/openai-provider', () => ({
  generateRecipeWithOpenAI: vi.fn(),
}));

import { generateRecipeWithOpenAI } from '@/server/recipe-generation/openai-provider';
import {
  InMemoryRecipeGenerationRateLimiter,
  setDefaultRecipeGenerationRateLimiterForTests,
} from '@/server/recipe-generation/rate-limit';
import { GET, POST } from '@/app/api/recipes/generate/route';

const generateMock = vi.mocked(generateRecipeWithOpenAI);

function makeRequest(
  body: unknown,
  init?: { contentType?: string | null; origin?: string | null },
): Request {
  const headers = new Headers();
  if (init?.contentType !== null) {
    headers.set('Content-Type', init?.contentType ?? 'application/json');
  }
  if (init?.origin) {
    headers.set('Origin', init.origin);
  }
  return new Request('http://localhost:3000/api/recipes/generate', {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

const validBody = {
  instruction: 'Remove duplicate lines and trim spaces',
  samples: [{ id: 'start', label: 'Start', text: '  a\n  a\n' }],
  documentMetadata: { characters: 8, lines: 2, bytes: 8 },
};

describe('POST /api/recipes/generate', () => {
  const previous = { ...process.env };

  beforeEach(() => {
    generateMock.mockReset();
    process.env.RECIPE_GENERATOR_MODE = 'openai';
    process.env.OPENAI_MODEL = 'gpt-5-mini';
    process.env.OPENAI_API_KEY = 'sk-test';
    setDefaultRecipeGenerationRateLimiterForTests(
      new InMemoryRecipeGenerationRateLimiter(100, 60_000),
    );
  });

  afterEach(() => {
    process.env = { ...previous };
    setDefaultRecipeGenerationRateLimiterForTests(null);
  });

  it('returns public status on GET without secrets', async () => {
    const response = await GET();
    const json = await response.json();
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(json.mode).toBe('openai');
    expect(JSON.stringify(json)).not.toMatch(/sk-test|OPENAI_API_KEY/i);
  });

  it('rejects non-JSON content types', async () => {
    const response = await POST(makeRequest(validBody, { contentType: 'text/plain' }));
    expect(response.status).toBe(415);
  });

  it('rejects unknown and full-document fields', async () => {
    const response = await POST(
      makeRequest({
        ...validBody,
        document: 'FULL DOCUMENT SHOULD NEVER BE SENT',
      }),
    );
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.code).toBe('FORBIDDEN_FIELD');
  });

  it('rejects model selection from the client', async () => {
    const response = await POST(
      makeRequest({
        ...validBody,
        model: 'gpt-evil',
      }),
    );
    expect(response.status).toBe(400);
  });

  it('rejects excessive instruction length', async () => {
    const response = await POST(
      makeRequest({
        ...validBody,
        instruction: 'x'.repeat(1501),
      }),
    );
    expect(response.status).toBe(400);
  });

  it('rejects excessive samples and total sample characters', async () => {
    const tooMany = await POST(
      makeRequest({
        instruction: 'Trim',
        samples: [
          { id: 'a', label: 'A', text: 'a' },
          { id: 'b', label: 'B', text: 'b' },
          { id: 'c', label: 'C', text: 'c' },
          { id: 'd', label: 'D', text: 'd' },
        ],
      }),
    );
    expect(tooMany.status).toBe(400);

    const tooLarge = await POST(
      makeRequest({
        instruction: 'Trim',
        samples: [
          { id: 'a', label: 'A', text: 'a'.repeat(2000) },
          { id: 'b', label: 'B', text: 'b'.repeat(2000) },
          { id: 'c', label: 'C', text: 'c'.repeat(2000) },
        ],
      }),
    );
    expect(tooLarge.status).toBe(400);
  });

  it('returns a valid plan with no-store and without logging samples', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    generateMock.mockResolvedValue({
      ok: true,
      result: {
        version: '1.0',
        outcome: 'plan',
        message: 'Trim and dedupe.',
        plan: {
          schemaVersion: '1.0',
          title: 'Clean list',
          summary: 'Trim and dedupe.',
          assumptions: [],
          warnings: [],
          operations: [
            {
              id: 'op1',
              type: 'lines.trim',
              enabled: true,
              description: 'Trim',
              mode: 'both',
            },
          ],
        },
      },
    });
    const response = await POST(makeRequest(validBody, { origin: 'http://localhost:3000' }));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    const json = await response.json();
    expect(json.ok).toBe(true);
    expect(json.result.outcome).toBe('plan');
    const logged = [...logSpy.mock.calls, ...errorSpy.mock.calls]
      .map((call) => JSON.stringify(call))
      .join('\n');
    expect(logged).not.toContain(validBody.samples[0]!.text);
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('returns unsupported envelopes from the provider', async () => {
    generateMock.mockResolvedValue({
      ok: true,
      result: {
        version: '1.0',
        outcome: 'unsupported',
        message: 'Needs creative writing.',
        plan: null,
      },
    });
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.result.outcome).toBe('unsupported');
  });

  it('maps configuration failures to 503', async () => {
    generateMock.mockResolvedValue({
      ok: false,
      code: 'CONFIGURATION_UNAVAILABLE',
      message: 'Missing key',
    });
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(503);
  });

  it('maps provider timeouts to 504', async () => {
    generateMock.mockResolvedValue({
      ok: false,
      code: 'PROVIDER_TIMEOUT',
      message: 'Timed out',
    });
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(504);
  });

  it('returns RATE_LIMITED when the limiter blocks', async () => {
    setDefaultRecipeGenerationRateLimiterForTests(
      new InMemoryRecipeGenerationRateLimiter(1, 60_000),
    );
    generateMock.mockResolvedValue({
      ok: true,
      result: {
        version: '1.0',
        outcome: 'unsupported',
        message: 'Nope',
        plan: null,
      },
    });
    expect((await POST(makeRequest(validBody))).status).toBe(200);
    const limited = await POST(makeRequest(validBody));
    expect(limited.status).toBe(429);
    const json = await limited.json();
    expect(json.code).toBe('RATE_LIMITED');
  });

  it('rejects cross-origin requests', async () => {
    const response = await POST(makeRequest(validBody, { origin: 'https://evil.example' }));
    expect(response.status).toBe(403);
  });
});
