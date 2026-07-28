import type { TransformationPlan } from '@tft/transformation-schema';

export function basePlan(
  operations: TransformationPlan['operations'],
  overrides: Partial<TransformationPlan> = {},
): TransformationPlan {
  return {
    schemaVersion: '1.0',
    title: 'Engine test plan',
    summary: 'Deterministic engine test plan.',
    assumptions: [],
    warnings: [],
    operations,
    ...overrides,
  };
}
