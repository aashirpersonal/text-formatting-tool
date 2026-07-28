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
 * Cancellation terminates the Worker and ignores stale responses.
 */
export class TransformationWorkerClient {
  private worker: Worker | null = null;
  private readonly createWorker: WorkerFactory;
  private activeRequestId: string | null = null;
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
   * Terminate the current Worker (if any) and clear the active request.
   * Does not mutate caller document state — that is the UI's responsibility.
   */
  cancel(): void {
    this.activeRequestId = null;
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  dispose(): void {
    this.cancel();
    this.disposed = true;
  }

  isBusy(): boolean {
    return this.activeRequestId !== null;
  }

  execute(args: WorkerExecuteArgs): Promise<ExecutionResult> {
    if (this.disposed) {
      return Promise.reject(new Error('TransformationWorkerClient has been disposed.'));
    }

    // Supersede any in-flight work.
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
        if (this.activeRequestId !== requestId) {
          return;
        }

        if (message.type === 'started') {
          return;
        }

        cleanup();
        this.activeRequestId = null;

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
        if (this.activeRequestId !== requestId) {
          return;
        }
        cleanup();
        this.activeRequestId = null;
        this.cancel();
        reject(new Error('Transformation worker failed unexpectedly.'));
      };

      const cleanup = () => {
        worker.removeEventListener('message', onMessage as EventListener);
        worker.removeEventListener('error', onError);
      };

      worker.addEventListener('message', onMessage as EventListener);
      worker.addEventListener('error', onError);
      worker.postMessage(request);
    });
  }
}
