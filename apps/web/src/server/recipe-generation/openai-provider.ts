import {
  getRecipeGenerationResultJsonSchema,
  parseRecipeGenerationResult,
  type RecipeGenerationApiRequest,
  type RecipeGenerationResultEnvelope,
} from '@tft/transformation-schema';
import OpenAI from 'openai';
import { getRecipeGeneratorRuntimeConfig } from './config';
import { prepareJsonSchemaForOpenAI } from './openai-json-schema';
import { buildRecipeGenerationSystemPrompt, buildRecipeGenerationUserPrompt } from './prompt';

export type OpenAIRecipeProviderErrorCode =
  | 'CONFIGURATION_UNAVAILABLE'
  | 'PROVIDER_TIMEOUT'
  | 'PROVIDER_ERROR'
  | 'MALFORMED_PROVIDER_OUTPUT'
  | 'UNSUPPORTED';

export type OpenAIRecipeProviderResult =
  | { readonly ok: true; readonly result: RecipeGenerationResultEnvelope }
  | {
      readonly ok: false;
      readonly code: OpenAIRecipeProviderErrorCode;
      readonly message: string;
    };

export type OpenAIResponsesClient = {
  responses: {
    create: (
      body: Record<string, unknown>,
      options?: { signal?: AbortSignal },
    ) => Promise<{
      output_text?: string;
      status?: string;
      error?: { message?: string } | null;
    }>;
  };
};

export type GenerateRecipeWithOpenAIOptions = {
  readonly request: RecipeGenerationApiRequest;
  readonly signal?: AbortSignal;
  readonly client?: OpenAIResponsesClient;
  readonly env?: Record<string, string | undefined>;
  readonly allowOneRepairRetry?: boolean;
};

function extractOutputText(response: {
  output_text?: string;
  output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
}): string | null {
  if (typeof response.output_text === 'string' && response.output_text.trim()) {
    return response.output_text;
  }
  const chunks: string[] = [];
  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === 'output_text' && typeof content.text === 'string') {
        chunks.push(content.text);
      }
    }
  }
  const joined = chunks.join('\n').trim();
  return joined.length > 0 ? joined : null;
}

async function callOnce(
  client: OpenAIResponsesClient,
  model: string,
  request: RecipeGenerationApiRequest,
  signal: AbortSignal | undefined,
  repairNote?: string,
): Promise<OpenAIRecipeProviderResult> {
  const schema = prepareJsonSchemaForOpenAI(getRecipeGenerationResultJsonSchema());
  const userPrompt = buildRecipeGenerationUserPrompt(request);
  const input = [
    { role: 'system', content: buildRecipeGenerationSystemPrompt() },
    {
      role: 'user',
      content: repairNote ? `${userPrompt}\n\nREPAIR_NOTE:\n${repairNote}` : userPrompt,
    },
  ];

  try {
    const response = await client.responses.create(
      {
        model,
        store: false,
        input,
        text: {
          format: {
            type: 'json_schema',
            name: 'recipe_generation_result',
            strict: true,
            schema,
          },
        },
      },
      signal ? { signal } : undefined,
    );

    if (response.status === 'incomplete') {
      return {
        ok: false,
        code: 'MALFORMED_PROVIDER_OUTPUT',
        message: 'The model returned an incomplete response.',
      };
    }

    const text = extractOutputText(response);
    if (!text) {
      return {
        ok: false,
        code: 'MALFORMED_PROVIDER_OUTPUT',
        message: 'The model returned no structured output.',
      };
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(text);
    } catch {
      return {
        ok: false,
        code: 'MALFORMED_PROVIDER_OUTPUT',
        message: 'The model returned non-JSON output.',
      };
    }

    try {
      const result = parseRecipeGenerationResult(parsedJson);
      if (result.outcome === 'unsupported') {
        return { ok: true, result };
      }
      return { ok: true, result };
    } catch {
      return {
        ok: false,
        code: 'MALFORMED_PROVIDER_OUTPUT',
        message: 'The model returned a schema-invalid result.',
      };
    }
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Provider request failed.';
    const safeMessage = message.replace(/sk-[A-Za-z0-9_-]+/gi, '[REDACTED]');
    if (/timeout|aborted|AbortError/i.test(safeMessage)) {
      return {
        ok: false,
        code: 'PROVIDER_TIMEOUT',
        message: 'The AI service timed out. Try again.',
      };
    }
    if (/invalid_json_schema|Invalid schema/i.test(safeMessage)) {
      return {
        ok: false,
        code: 'PROVIDER_ERROR',
        message: 'The recipe schema was rejected by the AI service. Check server configuration.',
      };
    }
    return {
      ok: false,
      code: 'PROVIDER_ERROR',
      message: 'The AI service is temporarily unavailable.',
    };
  }
}

export async function generateRecipeWithOpenAI(
  options: GenerateRecipeWithOpenAIOptions,
): Promise<OpenAIRecipeProviderResult> {
  const env = options.env ?? process.env;
  const config = getRecipeGeneratorRuntimeConfig(env);
  if (
    config.mode !== 'openai' ||
    !config.openaiConfigured ||
    !config.modelConfigured ||
    !config.modelName
  ) {
    return {
      ok: false,
      code: 'CONFIGURATION_UNAVAILABLE',
      message:
        'OpenAI recipe generation is not configured. Set RECIPE_GENERATOR_MODE, OPENAI_MODEL, and OPENAI_API_KEY.',
    };
  }

  const client =
    options.client ??
    (new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      timeout: 45_000,
      maxRetries: 0,
    }) as unknown as OpenAIResponsesClient);

  const first = await callOnce(client, config.modelName, options.request, options.signal);
  if (first.ok) {
    return first;
  }
  if (
    options.allowOneRepairRetry !== false &&
    first.code === 'MALFORMED_PROVIDER_OUTPUT' &&
    !options.signal?.aborted
  ) {
    return callOnce(
      client,
      config.modelName,
      options.request,
      options.signal,
      'Return only valid JSON matching the schema. If unsupported, use outcome "unsupported" with plan null.',
    );
  }
  return first;
}
