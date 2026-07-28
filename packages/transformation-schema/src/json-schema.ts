import { z } from 'zod';
import { transformationPlanSchema } from './plan.js';

/**
 * JSON Schema (draft 2020-12) derived from the Zod TransformationPlan schema.
 * Useful for documentation and future structured-model output constraints.
 * Runtime validation must still use the Zod schema / parse helpers.
 */
export const transformationPlanJsonSchema: Record<string, unknown> = z.toJSONSchema(
  transformationPlanSchema,
) as Record<string, unknown>;

export function getTransformationPlanJsonSchema(): Record<string, unknown> {
  return transformationPlanJsonSchema;
}
