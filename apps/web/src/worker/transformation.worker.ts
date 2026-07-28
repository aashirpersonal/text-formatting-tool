/// <reference lib="webworker" />

import { executeTransformationPlan } from '@tft/transformation-engine';
import type { TransformationWorkerRequest, TransformationWorkerResponse } from './protocol';
import { isWorkerRequest } from './protocol';

declare const self: DedicatedWorkerGlobalScope;

function post(message: TransformationWorkerResponse): void {
  self.postMessage(message);
}

self.onmessage = (event: MessageEvent<unknown>) => {
  const data = event.data;
  if (!isWorkerRequest(data)) {
    post({
      type: 'unexpected',
      requestId: 'unknown',
      message: 'Malformed worker request.',
    });
    return;
  }

  const request = data as TransformationWorkerRequest;
  post({
    type: 'started',
    requestId: request.requestId,
    mode: request.mode,
  });

  try {
    const result = executeTransformationPlan(request.input, request.plan, {
      limits: request.limits,
    });

    if (result.ok) {
      post({
        type: 'success',
        requestId: request.requestId,
        mode: request.mode,
        result,
      });
      return;
    }

    post({
      type: 'failure',
      requestId: request.requestId,
      mode: request.mode,
      result,
    });
  } catch (error) {
    post({
      type: 'unexpected',
      requestId: request.requestId,
      mode: request.mode,
      message: error instanceof Error ? error.message : 'Unexpected worker execution failure.',
    });
  }
};
