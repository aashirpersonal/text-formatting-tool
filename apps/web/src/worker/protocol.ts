import type { ExecutionLimits, ExecutionResult } from '@tft/transformation-engine';

export type ExecutionMode = 'preview' | 'full';

export type TransformationWorkerRequest = {
  readonly type: 'execute';
  readonly requestId: string;
  readonly mode: ExecutionMode;
  readonly input: string;
  readonly plan: unknown;
  readonly limits?: Partial<ExecutionLimits>;
};

export type TransformationWorkerStarted = {
  readonly type: 'started';
  readonly requestId: string;
  readonly mode: ExecutionMode;
};

export type TransformationWorkerSuccess = {
  readonly type: 'success';
  readonly requestId: string;
  readonly mode: ExecutionMode;
  readonly result: Extract<ExecutionResult, { ok: true }>;
};

export type TransformationWorkerFailure = {
  readonly type: 'failure';
  readonly requestId: string;
  readonly mode: ExecutionMode;
  readonly result: Extract<ExecutionResult, { ok: false }>;
};

export type TransformationWorkerUnexpected = {
  readonly type: 'unexpected';
  readonly requestId: string;
  readonly mode?: ExecutionMode;
  readonly message: string;
};

export type TransformationWorkerResponse =
  | TransformationWorkerStarted
  | TransformationWorkerSuccess
  | TransformationWorkerFailure
  | TransformationWorkerUnexpected;

export function isWorkerRequest(value: unknown): value is TransformationWorkerRequest {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    record.type === 'execute' &&
    typeof record.requestId === 'string' &&
    (record.mode === 'preview' || record.mode === 'full') &&
    typeof record.input === 'string'
  );
}
