/**
 * @tft/transformation-schema — Transformation Plan v1
 *
 * Strict, versioned JSON plans for deterministic text transforms.
 * Plans never contain executable JavaScript. See docs/v2/TRANSFORMATION_PLAN_V1.md.
 */

export { PLAN_LIMITS, type PlanLimits } from './limits.js';

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
} from './operations.js';

export {
  TRANSFORMATION_PLAN_SCHEMA_VERSION,
  transformationPlanSchema,
  parseTransformationPlan,
  safeParseTransformationPlan,
  type TransformationPlan,
  type SafeParseTransformationPlanResult,
} from './plan.js';

export { getTransformationPlanJsonSchema, transformationPlanJsonSchema } from './json-schema.js';
