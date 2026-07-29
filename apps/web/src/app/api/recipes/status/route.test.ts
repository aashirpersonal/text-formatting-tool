import { describe, expect, it } from 'vitest';
import { GET } from '@/app/api/recipes/status/route';

describe('GET /api/recipes/status', () => {
  const previous = { ...process.env };

  it('returns public mode status without secrets', async () => {
    process.env.RECIPE_GENERATOR_MODE = 'openai';
    process.env.OPENAI_MODEL = 'gpt-5-mini';
    process.env.OPENAI_API_KEY = 'sk-test';
    try {
      const response = await GET();
      const json = await response.json();
      expect(response.status).toBe(200);
      expect(response.headers.get('cache-control')).toBe('no-store');
      expect(json).toEqual({ mode: 'openai', openaiReady: true });
      expect(JSON.stringify(json)).not.toMatch(/sk-test|OPENAI_API_KEY/i);
    } finally {
      process.env = { ...previous };
    }
  });
});
