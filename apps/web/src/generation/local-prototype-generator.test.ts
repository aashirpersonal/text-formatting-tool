import { describe, expect, it } from 'vitest';
import { EXAMPLE_PROMPTS, LocalPrototypeRecipeGenerator } from './local-prototype-generator';

describe('LocalPrototypeRecipeGenerator', () => {
  const generator = new LocalPrototypeRecipeGenerator();

  it('exposes approved example prompts', () => {
    expect(EXAMPLE_PROMPTS.length).toBeGreaterThanOrEqual(6);
  });

  it('generates a schema-valid plan for a supported example', async () => {
    const result = await generator.generate({
      instruction: 'Remove duplicate lines and trim spaces',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.prototype).toBe(true);
      expect(result.plan.schemaVersion).toBe('1.0');
      expect(result.plan.operations.length).toBeGreaterThan(0);
      expect(result.title).toMatch(/clean/i);
    }
  });

  it('returns a friendly unsupported message for arbitrary instructions', async () => {
    const result = await generator.generate({
      instruction: 'Rewrite this as a Shakespearean sonnet about bananas',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNSUPPORTED_INSTRUCTION');
      expect(result.message).toMatch(/prototype currently supports/i);
      expect(result.message.toLowerCase()).not.toContain('openai');
    }
  });

  it('does not claim to be AI in the mode label', () => {
    expect(generator.modeLabel.toLowerCase()).toContain('prototype');
    expect(generator.modeLabel.toLowerCase()).toContain('no ai request');
    expect(generator.requiresSampleReview).toBe(false);
  });
});
