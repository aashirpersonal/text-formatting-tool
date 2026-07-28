import { describe, expect, it } from 'vitest';
import type { ExecutionResult } from '@tft/transformation-engine';
import {
  TransformationWorkerCancelledError,
  TransformationWorkerClient,
  isWorkerCancellation,
} from './transformation-worker-client';
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

  it('settles cancellation with a typed outcome and ignores stale responses', async () => {
    const worker = new MockWorker();
    const client = new TransformationWorkerClient(() => worker as unknown as Worker);
    const pending = client.execute({ mode: 'full', input: 'a', plan: {} });
    const requestId = worker.posted[0]!.requestId;
    client.cancel();
    expect(worker.terminated).toBe(true);
    await expect(pending).rejects.toBeInstanceOf(TransformationWorkerCancelledError);
    await expect(pending).rejects.toSatisfy((error: unknown) => isWorkerCancellation(error));
    worker.emit({
      type: 'success',
      requestId,
      mode: 'full',
      result: successResult('stale'),
    });
    await Promise.resolve();
    await expect(pending).rejects.toMatchObject({ code: 'WORKER_CANCELLED' });
  });

  it('does not expose partial output on cancellation', async () => {
    const worker = new MockWorker();
    const client = new TransformationWorkerClient(() => worker as unknown as Worker);
    const pending = client.execute({ mode: 'full', input: 'partial', plan: {} });
    client.cancel();
    const outcome = await pending.then(
      (result) => ({ kind: 'resolved' as const, result }),
      (error) => ({ kind: 'rejected' as const, error }),
    );
    expect(outcome.kind).toBe('rejected');
    if (outcome.kind === 'rejected') {
      expect(isWorkerCancellation(outcome.error)).toBe(true);
      expect(outcome.error).not.toHaveProperty('output');
    }
  });

  it('can run again after cancellation with a fresh worker', async () => {
    const workers: MockWorker[] = [];
    const client = new TransformationWorkerClient(() => {
      const worker = new MockWorker();
      workers.push(worker);
      return worker as unknown as Worker;
    });
    const first = client.execute({ mode: 'preview', input: 'a', plan: {} });
    client.cancel();
    await expect(first).rejects.toBeInstanceOf(TransformationWorkerCancelledError);
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

  it('dispose settles active execution before terminating', async () => {
    const worker = new MockWorker();
    const client = new TransformationWorkerClient(() => worker as unknown as Worker);
    const pending = client.execute({ mode: 'full', input: 'a', plan: {} });
    client.dispose();
    expect(worker.terminated).toBe(true);
    await expect(pending).rejects.toBeInstanceOf(TransformationWorkerCancelledError);
    await expect(client.execute({ mode: 'preview', input: 'b', plan: {} })).rejects.toThrow(
      /disposed/i,
    );
  });

  it('starting a new execution settles the previous as cancelled', async () => {
    const workers: MockWorker[] = [];
    const client = new TransformationWorkerClient(() => {
      const worker = new MockWorker();
      workers.push(worker);
      return worker as unknown as Worker;
    });
    const first = client.execute({ mode: 'preview', input: 'a', plan: {} });
    const second = client.execute({ mode: 'preview', input: 'b', plan: {} });
    await expect(first).rejects.toBeInstanceOf(TransformationWorkerCancelledError);
    const requestId = workers[1]!.posted[0]!.requestId;
    workers[1]!.emit({
      type: 'success',
      requestId,
      mode: 'preview',
      result: successResult('second'),
    });
    await expect(second).resolves.toMatchObject({ ok: true, output: 'second' });
  });
});
