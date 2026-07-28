import type { TransformationPlanPlaceholder } from '@tft/transformation-schema';

/**
 * Trusted browser-local transformation engine (foundation only).
 *
 * This package must never execute model-generated JavaScript.
 * Real allowlisted operations will be implemented in a later milestone.
 */

export const ENGINE_STATUS = 'not_implemented' as const;

export type EngineStatus = typeof ENGINE_STATUS;

export type EngineResult =
  | {
      readonly ok: false;
      readonly status: EngineStatus;
      readonly code: 'ENGINE_NOT_IMPLEMENTED';
      readonly message: string;
    }
  | {
      readonly ok: true;
      readonly output: string;
    };

export function getEngineStatus(): EngineStatus {
  return ENGINE_STATUS;
}

/**
 * Apply a transformation plan to input text.
 * Currently returns a typed not-implemented result.
 */
export function applyTransformationPlan(
  _input: string,
  _plan: TransformationPlanPlaceholder,
): EngineResult {
  return {
    ok: false,
    status: ENGINE_STATUS,
    code: 'ENGINE_NOT_IMPLEMENTED',
    message:
      'The trusted transformation engine is not implemented in this scaffold. ' +
      'No document was processed.',
  };
}
