import {
  parseRecipeGenerationResult,
  parseTransformationPlan,
  type RecipeGenerationResultEnvelope,
} from '@tft/transformation-schema';
import type {
  RecipeGenerationAdapter,
  RecipeGenerationFailure,
  RecipeGenerationRequest,
  RecipeGenerationResult,
} from './types';

const UNSUPPORTED_COPY =
  'This request needs open-ended writing or reasoning that the local transformation engine cannot safely reproduce.';

type FetchLike = typeof fetch;

function failure(code: RecipeGenerationFailure['code'], message: string): RecipeGenerationFailure {
  return { ok: false, code, message };
}

/**
 * Same-origin client adapter for POST /api/recipes/generate.
 * Never accepts or sends the full document.
 */
export class SameOriginOpenAIRecipeGenerator implements RecipeGenerationAdapter {
  readonly modeLabel = 'AI recipes · local execution';
  readonly requiresSampleReview = true;

  constructor(
    private readonly fetchImpl: FetchLike = fetch,
    private readonly endpoint = '/api/recipes/generate',
  ) {}

  async generate(request: RecipeGenerationRequest): Promise<RecipeGenerationResult> {
    if (!request.samples || request.samples.length === 0) {
      return failure(
        'VALIDATION_FAILED',
        'Approve at least one excerpt before generating a transformation.',
      );
    }

    const body = {
      instruction: request.instruction,
      samples: request.samples.map((sample) => ({
        id: sample.id,
        label: sample.label,
        text: sample.text,
      })),
      ...(request.documentMetadata ? { documentMetadata: request.documentMetadata } : {}),
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55_000);
    const onAbort = () => controller.abort();
    request.signal?.addEventListener('abort', onAbort, { once: true });

    try {
      const response = await this.fetchImpl(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
        credentials: 'same-origin',
      });

      const cacheControl = response.headers.get('cache-control');
      void cacheControl;

      let payload: unknown = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (response.status === 429) {
        return failure(
          'RATE_LIMITED',
          'Too many recipe requests. Please wait a moment and try again.',
        );
      }
      if (response.status === 503) {
        return failure(
          'CONFIGURATION_UNAVAILABLE',
          'AI recipe generation is not configured on this server yet.',
        );
      }
      if (response.status === 504) {
        return failure('TIMEOUT', 'The AI service timed out. Try again.');
      }
      if (request.signal?.aborted || controller.signal.aborted) {
        return failure('CANCELLED', 'Generation cancelled.');
      }
      if (!response.ok) {
        const message =
          payload &&
          typeof payload === 'object' &&
          'message' in payload &&
          typeof (payload as { message: unknown }).message === 'string'
            ? (payload as { message: string }).message
            : 'The AI service could not create a transformation.';
        if (response.status === 400) {
          return failure('VALIDATION_FAILED', message);
        }
        return failure('PROVIDER_FAILURE', message);
      }

      if (
        !payload ||
        typeof payload !== 'object' ||
        !('result' in payload) ||
        !(payload as { ok?: unknown }).ok
      ) {
        return failure('PROVIDER_FAILURE', 'Unexpected response from the recipe service.');
      }

      let envelope: RecipeGenerationResultEnvelope;
      try {
        envelope = parseRecipeGenerationResult((payload as { result: unknown }).result);
      } catch {
        return failure('INVALID_PLAN', 'The AI response failed local schema validation.');
      }

      if (envelope.outcome === 'unsupported' || !envelope.plan) {
        return failure('UNSUPPORTED_INSTRUCTION', envelope.message || UNSUPPORTED_COPY);
      }

      try {
        const plan = parseTransformationPlan(envelope.plan);
        return {
          ok: true,
          title: plan.title,
          explanation: envelope.message || plan.summary,
          assumptions: plan.assumptions,
          warnings: plan.warnings,
          plan,
          prototype: false,
        };
      } catch {
        return failure('INVALID_PLAN', 'The AI returned an invalid transformation plan.');
      }
    } catch (error) {
      if (
        request.signal?.aborted ||
        (error instanceof DOMException && error.name === 'AbortError') ||
        (error instanceof Error && /abort/i.test(error.name))
      ) {
        return failure('CANCELLED', 'Generation cancelled.');
      }
      return failure(
        'PROVIDER_FAILURE',
        'Could not reach the recipe service. Check your connection and try again.',
      );
    } finally {
      clearTimeout(timeout);
      request.signal?.removeEventListener('abort', onAbort);
    }
  }
}
