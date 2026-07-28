import { describe, expect, it, vi } from 'vitest';
import type { ExecutionResult } from '@tft/transformation-engine';
import { TransformationWorkerClient } from './transformation-worker-client';
import type { TransformationWorkerRequest, TransformationWorkerResponse } from './protocol';

class MockWorker {
  onmessage: ((event: MessageEvent<TransformationWorkerResponse>) => void) | null = null;
  listeners = new Map<string, Set<(event: Event) => void>>();
  terminated = false;
  posted: TransformationWorkerRequest[] = [];

  addEventListener(type: string, listener: (event: Event) => void) {
    const set = this.listeners.get(type) ?? new Set();
    set.add(listener);
    this.listeners.set(type, set);
  }

  removeEventListener(type: string, listener: (event: Event) => void) {
    this.listeners.get(type)?.delete(listener);
  }

  postMessage(data: TransformationWorkerRequest) {
    this.posted.push(data);
  }

  terminate() {
    this.terminated = true;
  }

  emit(message: TransformationWorkerResponse) {
    const event = { data: message } as MessageEvent<TransformationWorkerResponse>;
    for (const listener of this.listeners.get('message') ?? []) {
      listener(event as unknown as Event);
    }
  }
}

function successResult(output: string): Extract<ExecutionResult, { ok: true }> {
  return {
    ok: true,
    output,
    report: {
      schemaVersion: '1.0',
      inputCharacters: 1,
      outputCharacters: [...output].length,
      inputBytes: 1,
      outputBytes: new TextEncoder().encode(output).byteLength,
      operations: [],
      warnings: [],
    },
  };
}

describe('TransformationWorkerClient', () => {
  it('preserves request IDs and resolves success', async () => {
    const worker = new MockWorker();
    const client = new TransformationWorkerClient(() => worker as unknown as Worker);
    const pending = client.execute({
      mode: 'preview',
      input: 'a',
      plan: { schemaVersion: '1.0' },
    });
    expect(worker.posted[0]?.requestId).toMatch(/^req-/);
    const requestId = worker.posted[0]!.requestId;
    worker.emit({ type: 'started', requestId, mode: 'preview' });
    worker.emit({
      type: 'success',
      requestId,
      mode: 'preview',
      result: successResult('b'),
    });
    await expect(pending).resolves.toMatchObject({ ok: true, output: 'b' });
  });

  it('forwards structured failures', async () => {
    const worker = new MockWorker();
    const client = new TransformationWorkerClient(() => worker as unknown as Worker);
    const pending = client.execute({ mode: 'full', input: 'a', plan: {} });
    const requestId = worker.posted[0]!.requestId;
    worker.emit({
      type: 'failure',
      requestId,
      mode: 'full',
      result: {
        ok: false,
        error: { code: 'PLAN_INVALID', message: 'bad plan' },
      },
    });
    await expect(pending).resolves.toMatchObject({
      ok: false,
      error: { code: 'PLAN_INVALID' },
    });
  });

  it('ignores stale responses after cancellation', async () => {
    const worker = new MockWorker();
    const client = new TransformationWorkerClient(() => worker as unknown as Worker);
    const pending = client.execute({ mode: 'full', input: 'a', plan: {} });
    const requestId = worker.posted[0]!.requestId;
    const settled = vi.fn();
    void pending.then(settled, settled);
    client.cancel();
    expect(worker.terminated).toBe(true);
    worker.emit({
      type: 'success',
      requestId,
      mode: 'full',
      result: successResult('stale'),
    });
    await Promise.resolve();
    expect(settled).not.toHaveBeenCalled();
  });

  it('can run again after cancellation with a fresh worker', async () => {
    const workers: MockWorker[] = [];
    const client = new TransformationWorkerClient(() => {
      const worker = new MockWorker();
      workers.push(worker);
      return worker as unknown as Worker;
    });
    void client.execute({ mode: 'preview', input: 'a', plan: {} });
    client.cancel();
    const pending = client.execute({ mode: 'preview', input: 'b', plan: {} });
    expect(workers).toHaveLength(2);
    const requestId = workers[1]!.posted[0]!.requestId;
    workers[1]!.emit({
      type: 'success',
      requestId,
      mode: 'preview',
      result: successResult('ok'),
    });
    await expect(pending).resolves.toMatchObject({ ok: true, output: 'ok' });
  });
});
