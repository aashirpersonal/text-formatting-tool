import { describe, expect, it } from 'vitest';
import {
  RECIPE_GENERATION_LIMITS,
  parseRecipeGenerationApiRequest,
  safeParseRecipeGenerationApiRequest,
} from './index';

describe('recipeGenerationApiRequestSchema', () => {
  it('accepts a valid request', () => {
    const parsed = parseRecipeGenerationApiRequest({
      instruction: 'Trim lines',
      samples: [{ id: 'start', label: 'Start', text: 'hello' }],
      documentMetadata: { characters: 5, lines: 1, bytes: 5 },
    });
    expect(parsed.samples).toHaveLength(1);
  });

  it('rejects unknown fields and full-document aliases', () => {
    expect(
      safeParseRecipeGenerationApiRequest({
        instruction: 'Trim',
        samples: [{ id: 'a', label: 'A', text: 'x' }],
        document: 'nope',
      }).success,
    ).toBe(false);
  });

  it('rejects over-limit totals', () => {
    expect(
      safeParseRecipeGenerationApiRequest({
        instruction: 'Trim',
        samples: [
          { id: 'a', label: 'A', text: 'a'.repeat(2000) },
          { id: 'b', label: 'B', text: 'b'.repeat(2000) },
          { id: 'c', label: 'C', text: 'c'.repeat(2000) },
        ],
      }).success,
    ).toBe(false);
    expect(RECIPE_GENERATION_LIMITS.samples.totalTextMaxLength).toBe(5000);
  });
});
