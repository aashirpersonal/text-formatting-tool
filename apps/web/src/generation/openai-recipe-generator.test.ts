import { describe, expect, it, vi } from 'vitest';
import { SameOriginOpenAIRecipeGenerator } from './openai-recipe-generator';

describe('SameOriginOpenAIRecipeGenerator', () => {
  it('never sends a full document field', async () => {
    const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
      expect(body).not.toHaveProperty('document');
      expect(body).not.toHaveProperty('fullDocument');
      expect(body).not.toHaveProperty('text');
      expect(body).not.toHaveProperty('model');
      expect(body.samples).toEqual([{ id: 'start', label: 'Start', text: 'excerpt only' }]);
      return new Response(
        JSON.stringify({
          ok: true,
          result: {
            version: '1.0',
            outcome: 'plan',
            message: 'Trim lines.',
            plan: {
              schemaVersion: '1.0',
              title: 'Trim',
              summary: 'Trim lines.',
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
        }),
        {
          status: 200,
          headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' },
        },
      );
    });

    const generator = new SameOriginOpenAIRecipeGenerator(fetchImpl as typeof fetch);
    const result = await generator.generate({
      instruction: 'Trim spaces',
      samples: [{ id: 'start', label: 'Start', text: 'excerpt only' }],
      documentMetadata: { characters: 100_000, lines: 10, bytes: 100_000 },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.prototype).toBe(false);
    }
  });

  it('maps rate limit and configuration errors', async () => {
    const generator429 = new SameOriginOpenAIRecipeGenerator(
      (async () =>
        new Response(JSON.stringify({ code: 'RATE_LIMITED', message: 'Slow down' }), {
          status: 429,
        })) as typeof fetch,
    );
    expect(
      await generator429.generate({
        instruction: 'Trim',
        samples: [{ id: 'a', label: 'A', text: 'a' }],
      }),
    ).toMatchObject({ ok: false, code: 'RATE_LIMITED' });

    const generator503 = new SameOriginOpenAIRecipeGenerator(
      (async () =>
        new Response(JSON.stringify({ code: 'CONFIGURATION_UNAVAILABLE', message: 'Missing' }), {
          status: 503,
        })) as typeof fetch,
    );
    expect(
      await generator503.generate({
        instruction: 'Trim',
        samples: [{ id: 'a', label: 'A', text: 'a' }],
      }),
    ).toMatchObject({ ok: false, code: 'CONFIGURATION_UNAVAILABLE' });
  });

  it('supports cancellation', async () => {
    const controller = new AbortController();
    const generator = new SameOriginOpenAIRecipeGenerator((async (_url, init) => {
      controller.abort();
      await new Promise((resolve) => setTimeout(resolve, 10));
      if (init?.signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
      return new Response('{}', { status: 200 });
    }) as typeof fetch);
    const result = await generator.generate({
      instruction: 'Trim',
      samples: [{ id: 'a', label: 'A', text: 'a' }],
      signal: controller.signal,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('CANCELLED');
    }
  });
});
