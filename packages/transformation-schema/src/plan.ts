import { z } from 'zod';
import { PLAN_LIMITS } from './limits.js';
import { transformationOperationSchema } from './operations.js';

export const TRANSFORMATION_PLAN_SCHEMA_VERSION = '1.0' as const;

const boundedTextItem = (itemMax: number) => z.string().min(1).max(itemMax);

export const transformationPlanSchema = z
  .strictObject({
    schemaVersion: z.literal(TRANSFORMATION_PLAN_SCHEMA_VERSION),
    title: z.string().min(PLAN_LIMITS.title.minLength).max(PLAN_LIMITS.title.maxLength),
    summary: z.string().min(PLAN_LIMITS.summary.minLength).max(PLAN_LIMITS.summary.maxLength),
    assumptions: z
      .array(boundedTextItem(PLAN_LIMITS.assumptions.itemMaxLength))
      .max(PLAN_LIMITS.assumptions.maxItems),
    warnings: z
      .array(boundedTextItem(PLAN_LIMITS.warnings.itemMaxLength))
      .max(PLAN_LIMITS.warnings.maxItems),
    operations: z
      .array(transformationOperationSchema)
      .min(PLAN_LIMITS.operations.minItems)
      .max(PLAN_LIMITS.operations.maxItems),
  })
  .superRefine((plan, ctx) => {
    const seen = new Set<string>();
    for (const [index, operation] of plan.operations.entries()) {
      if (seen.has(operation.id)) {
        ctx.addIssue({
          code: 'custom',
          message: `Duplicate operation id "${operation.id}"`,
          path: ['operations', index, 'id'],
        });
      }
      seen.add(operation.id);
    }
  });

export type TransformationPlan = z.infer<typeof transformationPlanSchema>;

export type SafeParseTransformationPlanResult = ReturnType<
  typeof transformationPlanSchema.safeParse
>;

/**
 * Parse and validate an unknown value as TransformationPlan v1.
 * Throws a ZodError when validation fails.
 */
export function parseTransformationPlan(input: unknown): TransformationPlan {
  return transformationPlanSchema.parse(input);
}

/**
 * Safe parse for unknown plan values. Does not throw for validation failures.
 */
export function safeParseTransformationPlan(input: unknown): SafeParseTransformationPlanResult {
  return transformationPlanSchema.safeParse(input);
}
