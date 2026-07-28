export type RateLimitDecision = {
  readonly allowed: boolean;
  readonly retryAfterSeconds?: number;
  readonly reason?: string;
};

/**
 * Testable rate-limit boundary for recipe generation.
 * Local development uses an in-memory limiter.
 * Cloudflare Rate Limiting bindings can be wired later without changing callers.
 */
export interface RecipeGenerationRateLimiter {
  check(key: string): Promise<RateLimitDecision>;
}

export class InMemoryRecipeGenerationRateLimiter implements RecipeGenerationRateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  async check(key: string): Promise<RateLimitDecision> {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const recent = (this.hits.get(key) ?? []).filter((stamp) => stamp >= windowStart);
    if (recent.length >= this.limit) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil(((recent[0] ?? now) + this.windowMs - now) / 1000),
      );
      this.hits.set(key, recent);
      return {
        allowed: false,
        retryAfterSeconds,
        reason: 'RATE_LIMITED',
      };
    }
    recent.push(now);
    this.hits.set(key, recent);
    return { allowed: true };
  }

  /** Test helper */
  reset(): void {
    this.hits.clear();
  }
}

let sharedLimiter: InMemoryRecipeGenerationRateLimiter | null = null;

export function getDefaultRecipeGenerationRateLimiter(): RecipeGenerationRateLimiter {
  if (!sharedLimiter) {
    // 20 requests / 10 minutes per key in local/dev memory. Not a Cloudflare binding.
    sharedLimiter = new InMemoryRecipeGenerationRateLimiter(20, 10 * 60 * 1000);
  }
  return sharedLimiter;
}

/** Test-only seam. Production callers must not use this. */
export function setDefaultRecipeGenerationRateLimiterForTests(
  limiter: InMemoryRecipeGenerationRateLimiter | null,
): void {
  sharedLimiter = limiter;
}

/**
 * Stable rate-limit key that never includes instruction or sample text.
 */
export function buildRecipeRateLimitKey(parts: {
  readonly mode: string;
  readonly ipHash: string;
}): string {
  return `recipe-generate:${parts.mode}:${parts.ipHash}`;
}

export function hashIp(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
