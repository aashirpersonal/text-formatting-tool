/**
 * @tft/transformation-engine — deterministic allowlisted executor for Transformation Plan v1.
 *
 * Never executes model-generated JavaScript. Never uses eval/Function.
 * Browser and Web Worker compatible (TextEncoder; no Node Buffer).
 */

export { executeTransformationPlan } from './execute';

export {
  DEFAULT_EXECUTION_LIMITS,
  utf8ByteLength,
  characterCount,
  resolveExecutionLimits,
  type ExecutionLimits,
  type ExecutionOptions,
} from './limits';

export type {
  ExecutionResult,
  ExecutionSuccess,
  ExecutionFailure,
  ExecutionError,
  ExecutionErrorCode,
  ExecutionSuccessReport,
  OperationExecutionReport,
  OperationReportStatus,
  OperationApplyResult,
} from './types';

export {
  parseLineDocument,
  serializeLineDocument,
  type LineDocument,
  type LogicalLine,
  type LineEnding,
} from './line-document';
