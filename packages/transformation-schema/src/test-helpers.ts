import type { TransformationPlan } from '../src/index.js';

export function validPlan(
  overrides: Partial<TransformationPlan> & {
    operations?: TransformationPlan['operations'];
  } = {},
): TransformationPlan {
  return {
    schemaVersion: '1.0',
    title: 'Example plan',
    summary: 'A valid example transformation plan for tests.',
    assumptions: ['Input is plain text'],
    warnings: [],
    operations: [
      {
        id: 'op1',
        type: 'lines.trim',
        enabled: true,
        description: 'Trim each line',
        mode: 'both',
      },
    ],
    ...overrides,
  };
}
