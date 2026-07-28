import { z } from 'zod';
import { RECIPE_GENERATION_LIMITS } from './generation-limits';

const sampleSchema = z.strictObject({
  id: z.string().min(1).max(RECIPE_GENERATION_LIMITS.samples.idMaxLength),
  label: z.string().min(1).max(RECIPE_GENERATION_LIMITS.samples.labelMaxLength),
  text: z.string().min(1).max(RECIPE_GENERATION_LIMITS.samples.textMaxLength),
});

const documentMetadataSchema = z
  .strictObject({
    characters: z.number().int().min(0).max(RECIPE_GENERATION_LIMITS.metadata.charactersMax),
    lines: z.number().int().min(0).max(RECIPE_GENERATION_LIMITS.metadata.linesMax),
    bytes: z.number().int().min(0).max(RECIPE_GENERATION_LIMITS.metadata.bytesMax),
    fileExtension: z
      .string()
      .min(1)
      .max(RECIPE_GENERATION_LIMITS.metadata.fileExtensionMaxLength)
      .optional(),
  })
  .optional();

/**
 * Strict request body for POST /api/recipes/generate.
 * Rejects unknown fields and never accepts a full-document field.
 */
export const recipeGenerationApiRequestSchema = z
  .strictObject({
    instruction: z
      .string()
      .min(RECIPE_GENERATION_LIMITS.instruction.minLength)
      .max(RECIPE_GENERATION_LIMITS.instruction.maxLength),
    samples: z
      .array(sampleSchema)
      .min(RECIPE_GENERATION_LIMITS.samples.minItems)
      .max(RECIPE_GENERATION_LIMITS.samples.maxItems),
    documentMetadata: documentMetadataSchema,
  })
  .superRefine((value, ctx) => {
    const total = value.samples.reduce((sum, sample) => sum + sample.text.length, 0);
    if (total > RECIPE_GENERATION_LIMITS.samples.totalTextMaxLength) {
      ctx.addIssue({
        code: 'custom',
        message: `Total sample characters must be at most ${RECIPE_GENERATION_LIMITS.samples.totalTextMaxLength}`,
        path: ['samples'],
      });
    }
    const ids = new Set<string>();
    for (const [index, sample] of value.samples.entries()) {
      if (ids.has(sample.id)) {
        ctx.addIssue({
          code: 'custom',
          message: `Duplicate sample id "${sample.id}"`,
          path: ['samples', index, 'id'],
        });
      }
      ids.add(sample.id);
    }
  });

export type RecipeGenerationApiRequest = z.infer<typeof recipeGenerationApiRequestSchema>;
export type RecipeGenerationApiSample = z.infer<typeof sampleSchema>;

export type SafeParseRecipeGenerationApiRequest = ReturnType<
  typeof recipeGenerationApiRequestSchema.safeParse
>;

export function parseRecipeGenerationApiRequest(input: unknown): RecipeGenerationApiRequest {
  return recipeGenerationApiRequestSchema.parse(input);
}

export function safeParseRecipeGenerationApiRequest(
  input: unknown,
): SafeParseRecipeGenerationApiRequest {
  return recipeGenerationApiRequestSchema.safeParse(input);
}
