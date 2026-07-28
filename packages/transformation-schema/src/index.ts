/**
 * @tft/transformation-schema — Transformation Plan v1
 *
 * Strict, versioned JSON plans for deterministic text transforms.
 * Plans never contain executable JavaScript. See docs/v2/TRANSFORMATION_PLAN_V1.md.
 */

export { PLAN_LIMITS, type PlanLimits } from './limits';
export { RECIPE_GENERATION_LIMITS, type RecipeGenerationLimits } from './generation-limits';

export {
  OPERATION_TYPES,
  type OperationType,
  transformationOperationSchema,
  replaceLiteralOperationSchema,
  linesTrimOperationSchema,
  linesRemoveEmptyOperationSchema,
  linesDedupeOperationSchema,
  linesFilterContainsOperationSchema,
  linesAffixOperationSchema,
  lineEndingsNormalizeOperationSchema,
  unicodeNormalizeOperationSchema,
  type TransformationOperation,
  type ReplaceLiteralOperation,
  type LinesTrimOperation,
  type LinesRemoveEmptyOperation,
  type LinesDedupeOperation,
  type LinesFilterContainsOperation,
  type LinesAffixOperation,
  type LineEndingsNormalizeOperation,
  type UnicodeNormalizeOperation,
} from './operations';

export {
  TRANSFORMATION_PLAN_SCHEMA_VERSION,
  transformationPlanSchema,
  parseTransformationPlan,
  safeParseTransformationPlan,
  type TransformationPlan,
  type SafeParseTransformationPlanResult,
} from './plan';

export {
  RECIPE_GENERATION_RESULT_VERSION,
  recipeGenerationResultSchema,
  parseRecipeGenerationResult,
  safeParseRecipeGenerationResult,
  type RecipeGenerationResultEnvelope,
  type SafeParseRecipeGenerationResult,
} from './generation-result';

export {
  recipeGenerationApiRequestSchema,
  parseRecipeGenerationApiRequest,
  safeParseRecipeGenerationApiRequest,
  type RecipeGenerationApiRequest,
  type RecipeGenerationApiSample,
  type SafeParseRecipeGenerationApiRequest,
} from './generation-request';

export { getTransformationPlanJsonSchema, transformationPlanJsonSchema } from './json-schema';
export {
  getRecipeGenerationResultJsonSchema,
  recipeGenerationResultJsonSchema,
} from './generation-json-schema';
