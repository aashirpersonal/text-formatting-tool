import { z } from 'zod';
import { recipeGenerationResultSchema } from './generation-result';

/**
 * JSON Schema derived from the recipe-generation result Zod schema.
 * Prefer this for OpenAI Structured Outputs; still re-validate with Zod at runtime.
 */
export const recipeGenerationResultJsonSchema: Record<string, unknown> = z.toJSONSchema(
  recipeGenerationResultSchema,
) as Record<string, unknown>;

export function getRecipeGenerationResultJsonSchema(): Record<string, unknown> {
  return recipeGenerationResultJsonSchema;
}
