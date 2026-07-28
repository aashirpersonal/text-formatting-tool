import { describe, expect, it } from 'vitest';
import {
  RECIPE_GENERATION_RESULT_VERSION,
  getRecipeGenerationResultJsonSchema,
  parseRecipeGenerationResult,
  safeParseRecipeGenerationResult,
} from './index';
import { validPlan as buildValidPlan } from './test-helpers';

const validPlan = buildValidPlan({
  title: 'Clean list',
  summary: 'Trim and dedupe lines.',
  assumptions: [],
  warnings: [],
});

describe('recipeGenerationResultSchema', () => {
  it('accepts a valid plan outcome', () => {
    const result = parseRecipeGenerationResult({
      version: RECIPE_GENERATION_RESULT_VERSION,
      outcome: 'plan',
      message: 'Created a local transformation plan.',
      plan: validPlan,
    });
    expect(result.outcome).toBe('plan');
    expect(result.plan?.title).toBe('Clean list');
  });

  it('accepts a valid unsupported outcome', () => {
    const result = parseRecipeGenerationResult({
      version: RECIPE_GENERATION_RESULT_VERSION,
      outcome: 'unsupported',
      message: 'This needs open-ended writing.',
      plan: null,
    });
    expect(result.plan).toBeNull();
  });

  it('rejects plan outcome with null plan', () => {
    const result = safeParseRecipeGenerationResult({
      version: '1.0',
      outcome: 'plan',
      message: 'Missing plan',
      plan: null,
    });
    expect(result.success).toBe(false);
  });

  it('rejects unsupported outcome with non-null plan', () => {
    const result = safeParseRecipeGenerationResult({
      version: '1.0',
      outcome: 'unsupported',
      message: 'Nope',
      plan: validPlan,
    });
    expect(result.success).toBe(false);
  });

  it('rejects unknown fields', () => {
    const result = safeParseRecipeGenerationResult({
      version: '1.0',
      outcome: 'unsupported',
      message: 'Nope',
      plan: null,
      code: 'evil',
    });
    expect(result.success).toBe(false);
  });

  it('rejects excessive messages', () => {
    const result = safeParseRecipeGenerationResult({
      version: '1.0',
      outcome: 'unsupported',
      message: 'x'.repeat(501),
      plan: null,
    });
    expect(result.success).toBe(false);
  });

  it('exports JSON Schema', () => {
    const schema = getRecipeGenerationResultJsonSchema();
    expect(schema).toBeTruthy();
    expect(typeof schema).toBe('object');
  });
});
