import type { ExecutionLimits, ExecutionResult } from '@tft/transformation-engine';
import type {
  ExecutionMode,
  TransformationWorkerRequest,
  TransformationWorkerResponse,
} from './protocol';

export type WorkerExecuteArgs = {
  readonly mode: ExecutionMode;
  readonly input: string;
  readonly plan: unknown;
  readonly limits?: Partial<ExecutionLimits>;
};

export type WorkerFactory = () => Worker;

/** Client-level cancellation — not an engine ExecutionResult failure. */
export class TransformationWorkerCancelledError extends Error {
  readonly code = 'WORKER_CANCELLED' as const;

  constructor(message = 'Transformation execution was cancelled.') {
    super(message);
    this.name = 'TransformationWorkerCancelledError';
  }
}

export function isWorkerCancellation(error: unknown): error is TransformationWorkerCancelledError {
  return (
    error instanceof TransformationWorkerCancelledError ||
    (typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: unknown }).code === 'WORKER_CANCELLED')
  );
}

type PendingExecution = {
  readonly requestId: string;
  readonly cleanup: () => void;
  readonly resolve: (result: ExecutionResult) => void;
  readonly reject: (error: unknown) => void;
};

let requestCounter = 0;

function nextRequestId(): string {
  requestCounter += 1;
  return `req-${requestCounter}`;
}

const defaultWorkerFactory: WorkerFactory = () =>
  new Worker(new URL('./transformation.worker.ts', import.meta.url), {
    type: 'module',
  });

/**
 * Typed client for the transformation Web Worker.
 * Cancellation terminates the Worker, settles the active Promise, and ignores stale responses.
 */
export class TransformationWorkerClient {
  private worker: Worker | null = null;
  private readonly createWorker: WorkerFactory;
  private activeRequestId: string | null = null;
  private pending: PendingExecution | null = null;
  private disposed = false;

  constructor(createWorker: WorkerFactory = defaultWorkerFactory) {
    this.createWorker = createWorker;
  }

  private ensureWorker(): Worker {
    if (this.disposed) {
      throw new Error('TransformationWorkerClient has been disposed.');
    }
    if (!this.worker) {
      this.worker = this.createWorker();
    }
    return this.worker;
  }

  /**
   * Settle the active Promise (if any) as cancelled, terminate the Worker, and clear listeners.
   * Does not mutate caller document state — that is the UI's responsibility.
   */
  cancel(): void {
    this.settleActiveAsCancelled();
  }

  dispose(): void {
    this.settleActiveAsCancelled();
    this.disposed = true;
  }

  isBusy(): boolean {
    return this.activeRequestId !== null;
  }

  private settleActiveAsCancelled(): void {
    const active = this.pending;
    this.pending = null;
    this.activeRequestId = null;
    if (active) {
      active.cleanup();
      active.reject(new TransformationWorkerCancelledError());
    }
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  execute(args: WorkerExecuteArgs): Promise<ExecutionResult> {
    if (this.disposed) {
      return Promise.reject(new Error('TransformationWorkerClient has been disposed.'));
    }

    // Supersede any in-flight work (settles previous Promise as cancelled).
    this.cancel();

    const requestId = nextRequestId();
    this.activeRequestId = requestId;
    const worker = this.ensureWorker();

    const request: TransformationWorkerRequest = {
      type: 'execute',
      requestId,
      mode: args.mode,
      input: args.input,
      plan: args.plan,
      limits: args.limits,
    };

    return new Promise<ExecutionResult>((resolve, reject) => {
      const onMessage = (event: MessageEvent<TransformationWorkerResponse>) => {
        const message = event.data;
        if (!message || message.requestId !== requestId) {
          // Stale response — ignore.
          return;
        }
        if (this.activeRequestId !== requestId || this.pending?.requestId !== requestId) {
          return;
        }

        if (message.type === 'started') {
          return;
        }

        this.finishPending();
        if (message.type === 'success') {
          resolve(message.result);
          return;
        }
        if (message.type === 'failure') {
          resolve(message.result);
          return;
        }
        reject(new Error(message.message));
      };

      const onError = () => {
        if (this.activeRequestId !== requestId || this.pending?.requestId !== requestId) {
          return;
        }
        this.finishPending();
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
        }
        reject(new Error('Transformation worker failed unexpectedly.'));
      };

      const cleanup = () => {
        worker.removeEventListener('message', onMessage as EventListener);
        worker.removeEventListener('error', onError);
      };

      this.pending = { requestId, cleanup, resolve, reject };
      worker.addEventListener('message', onMessage as EventListener);
      worker.addEventListener('error', onError);
      worker.postMessage(request);
    });
  }

  /** Clear pending bookkeeping after a terminal success/failure/unexpected path. */
  private finishPending(): void {
    const active = this.pending;
    this.pending = null;
    this.activeRequestId = null;
    active?.cleanup();
  }
}
