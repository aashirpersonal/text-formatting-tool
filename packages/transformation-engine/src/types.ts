import type { TransformationOperation } from '@tft/transformation-schema';

export type OperationReportStatus = 'applied' | 'no_change' | 'skipped';

export type OperationExecutionReport = {
  readonly operationId: string;
  readonly operationType: TransformationOperation['type'];
  readonly status: OperationReportStatus;
  readonly changed: boolean;
  readonly changeCount: number;
  readonly warnings: readonly string[];
};

export type ExecutionSuccessReport = {
  readonly schemaVersion: '1.0';
  readonly inputCharacters: number;
  readonly outputCharacters: number;
  readonly inputBytes: number;
  readonly outputBytes: number;
  readonly operations: readonly OperationExecutionReport[];
  readonly warnings: readonly string[];
};

export type ExecutionErrorCode =
  | 'PLAN_INVALID'
  | 'INPUT_LIMIT_EXCEEDED'
  | 'OUTPUT_LIMIT_EXCEEDED'
  | 'OPERATION_LIMIT_EXCEEDED'
  | 'OPERATION_FAILED';

export type ExecutionError = {
  readonly code: ExecutionErrorCode;
  readonly message: string;
  readonly operationId?: string;
  readonly operationType?: string;
  readonly validationIssues?: unknown;
};

export type ExecutionSuccess = {
  readonly ok: true;
  readonly output: string;
  readonly report: ExecutionSuccessReport;
};

export type ExecutionFailure = {
  readonly ok: false;
  readonly error: ExecutionError;
};

export type ExecutionResult = ExecutionSuccess | ExecutionFailure;

export type OperationApplyResult = {
  readonly output: string;
  readonly changeCount: number;
  readonly warnings: readonly string[];
};

export type { ExecutionLimits, ExecutionOptions } from './limits.js';
