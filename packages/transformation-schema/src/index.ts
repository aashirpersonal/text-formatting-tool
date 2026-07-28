/**
 * Foundation placeholder for the future versioned TransformationPlan.
 *
 * This package intentionally does not yet define a production schema.
 * A real allowlisted discriminated-union schema will be added in a later
 * milestone (see docs/v2/ARCHITECTURE_DECISIONS.md ADR-005).
 */

export const TRANSFORMATION_SCHEMA_STATUS = 'not_implemented' as const;

export type TransformationSchemaStatus = typeof TRANSFORMATION_SCHEMA_STATUS;

/**
 * Placeholder type only. Do not treat this as a validated production plan.
 */
export type TransformationPlanPlaceholder = {
  readonly planVersion: 'unspecified';
  readonly status: TransformationSchemaStatus;
};

export function createTransformationPlanPlaceholder(): TransformationPlanPlaceholder {
  return {
    planVersion: 'unspecified',
    status: TRANSFORMATION_SCHEMA_STATUS,
  };
}
