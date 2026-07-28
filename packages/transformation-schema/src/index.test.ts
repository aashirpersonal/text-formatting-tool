import { describe, expect, it } from 'vitest';
import { TRANSFORMATION_SCHEMA_STATUS, createTransformationPlanPlaceholder } from './index.js';

describe('@tft/transformation-schema', () => {
  it('exposes an explicit not_implemented status', () => {
    expect(TRANSFORMATION_SCHEMA_STATUS).toBe('not_implemented');
  });

  it('creates a placeholder plan contract', () => {
    const plan = createTransformationPlanPlaceholder();
    expect(plan.status).toBe('not_implemented');
    expect(plan.planVersion).toBe('unspecified');
  });
});
