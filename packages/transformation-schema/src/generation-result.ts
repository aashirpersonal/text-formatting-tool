import { z } from 'zod';
import { RECIPE_GENERATION_LIMITS } from './generation-limits';
import { transformationPlanSchema } from './plan';

export const RECIPE_GENERATION_RESULT_VERSION = '1.0' as const;

/**
 * Versioned AI recipe-generation result.
 * Never contains executable code. Plans must be Transformation Plan v1 when present.
 */
export const recipeGenerationResultSchema = z
  .strictObject({
    version: z.literal(RECIPE_GENERATION_RESULT_VERSION),
    outcome: z.enum(['plan', 'unsupported']),
    message: z
      .string()
      .min(RECIPE_GENERATION_LIMITS.message.minLength)
      .max(RECIPE_GENERATION_LIMITS.message.maxLength),
    plan: transformationPlanSchema.nullable(),
  })
  .superRefine((value, ctx) => {
    if (value.outcome === 'plan' && value.plan === null) {
      ctx.addIssue({
        code: 'custom',
        message: 'outcome "plan" requires a non-null TransformationPlan',
        path: ['plan'],
      });
    }
    if (value.outcome === 'unsupported' && value.plan !== null) {
      ctx.addIssue({
        code: 'custom',
        message: 'outcome "unsupported" requires plan to be null',
        path: ['plan'],
      });
    }
  });

export type RecipeGenerationResultEnvelope = z.infer<typeof recipeGenerationResultSchema>;

export type SafeParseRecipeGenerationResult = ReturnType<
  typeof recipeGenerationResultSchema.safeParse
>;

export function parseRecipeGenerationResult(input: unknown): RecipeGenerationResultEnvelope {
  return recipeGenerationResultSchema.parse(input);
}

export function safeParseRecipeGenerationResult(input: unknown): SafeParseRecipeGenerationResult {
  return recipeGenerationResultSchema.safeParse(input);
}
