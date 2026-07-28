import {
  RECIPE_GENERATION_LIMITS,
  safeParseRecipeGenerationApiRequest,
} from '@tft/transformation-schema';
import { NextResponse } from 'next/server';
import {
  getPublicRecipeGeneratorStatus,
  getRecipeGeneratorRuntimeConfig,
} from '@/server/recipe-generation/config';
import { generateRecipeWithOpenAI } from '@/server/recipe-generation/openai-provider';
import {
  buildRecipeRateLimitKey,
  getDefaultRecipeGenerationRateLimiter,
  hashIp,
} from '@/server/recipe-generation/rate-limit';

export const runtime = 'nodejs';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store',
};

function jsonError(
  status: number,
  body: { code: string; message: string; details?: unknown },
): NextResponse {
  return NextResponse.json(body, { status, headers: NO_STORE_HEADERS });
}

function getRequestIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'local'
  );
}

function assertSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) {
    // Same-origin non-browser clients / curl may omit Origin.
    return true;
  }
  try {
    const requestUrl = new URL(request.url);
    const originUrl = new URL(origin);
    const normalizeHost = (host: string): string =>
      host
        .toLowerCase()
        .replace(/^localhost(?=:|$)/, '127.0.0.1')
        .replace(/^\[::1\](?=:|$)/, '127.0.0.1')
        .replace(/^::1(?=:|$)/, '127.0.0.1');
    return normalizeHost(requestUrl.host) === normalizeHost(originUrl.host);
  } catch {
    return false;
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(getPublicRecipeGeneratorStatus(), {
    headers: NO_STORE_HEADERS,
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  if (request.method !== 'POST') {
    return jsonError(405, { code: 'METHOD_NOT_ALLOWED', message: 'POST only.' });
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return jsonError(415, {
      code: 'UNSUPPORTED_MEDIA_TYPE',
      message: 'Content-Type must be application/json.',
    });
  }

  if (!assertSameOrigin(request)) {
    return jsonError(403, {
      code: 'FORBIDDEN_ORIGIN',
      message: 'Cross-origin recipe generation is not allowed.',
    });
  }

  const config = getRecipeGeneratorRuntimeConfig();
  if (config.mode !== 'openai') {
    return jsonError(503, {
      code: 'CONFIGURATION_UNAVAILABLE',
      message: 'Recipe generation is running in prototype mode. No remote AI endpoint is active.',
    });
  }

  const limiter = getDefaultRecipeGenerationRateLimiter();
  const rate = await limiter.check(
    buildRecipeRateLimitKey({
      mode: config.mode,
      ipHash: hashIp(getRequestIp(request)),
    }),
  );
  if (!rate.allowed) {
    return NextResponse.json(
      {
        code: 'RATE_LIMITED',
        message: 'Too many recipe requests. Please wait and try again.',
      },
      {
        status: 429,
        headers: {
          ...NO_STORE_HEADERS,
          ...(rate.retryAfterSeconds ? { 'Retry-After': String(rate.retryAfterSeconds) } : {}),
        },
      },
    );
  }

  let rawText = '';
  try {
    rawText = await request.text();
  } catch {
    return jsonError(400, { code: 'INVALID_BODY', message: 'Could not read request body.' });
  }

  if (rawText.length > RECIPE_GENERATION_LIMITS.maxRequestBodyCharacters) {
    return jsonError(413, {
      code: 'BODY_TOO_LARGE',
      message: 'Request body exceeds the allowed size.',
    });
  }

  let json: unknown;
  try {
    json = JSON.parse(rawText) as unknown;
  } catch {
    return jsonError(400, { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' });
  }

  if (
    json &&
    typeof json === 'object' &&
    ('document' in json || 'fullDocument' in json || 'text' in json || 'model' in json)
  ) {
    return jsonError(400, {
      code: 'FORBIDDEN_FIELD',
      message: 'The request includes a forbidden field.',
    });
  }

  const parsed = safeParseRecipeGenerationApiRequest(json);
  if (!parsed.success) {
    return jsonError(400, {
      code: 'VALIDATION_FAILED',
      message: 'Request validation failed.',
      details: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 50_000);
  try {
    const result = await generateRecipeWithOpenAI({
      request: parsed.data,
      signal: controller.signal,
    });
    if (!result.ok) {
      const status =
        result.code === 'CONFIGURATION_UNAVAILABLE'
          ? 503
          : result.code === 'PROVIDER_TIMEOUT'
            ? 504
            : result.code === 'MALFORMED_PROVIDER_OUTPUT'
              ? 502
              : 502;
      return jsonError(status, { code: result.code, message: result.message });
    }
    return NextResponse.json(
      {
        ok: true,
        result: result.result,
      },
      { headers: NO_STORE_HEADERS },
    );
  } finally {
    clearTimeout(timeout);
  }
}
