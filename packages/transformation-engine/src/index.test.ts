import { describe, expect, it } from 'vitest';
import { createTransformationPlanPlaceholder } from '@tft/transformation-schema';
import { applyTransformationPlan, getEngineStatus } from './index.js';

describe('@tft/transformation-engine', () => {
  it('reports not_implemented status', () => {
    expect(getEngineStatus()).toBe('not_implemented');
  });

  it('returns a typed not-implemented result without transforming input', () => {
    const input = 'hello\nworld';
    const result = applyTransformationPlan(input, createTransformationPlanPlaceholder());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('ENGINE_NOT_IMPLEMENTED');
      expect(result.status).toBe('not_implemented');
      expect(result.message).toMatch(/not implemented/i);
    }
  });
});
