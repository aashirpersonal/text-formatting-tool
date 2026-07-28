/**
 * Limits for recipe-generation request and result envelopes (v1).
 * Invalid values are rejected; nothing is silently truncated.
 */
export const RECIPE_GENERATION_LIMITS = Object.freeze({
  instruction: Object.freeze({ minLength: 1, maxLength: 1_500 }),
  samples: Object.freeze({
    minItems: 1,
    maxItems: 3,
    idMaxLength: 64,
    labelMaxLength: 80,
    textMaxLength: 2_000,
    totalTextMaxLength: 5_000,
  }),
  message: Object.freeze({ minLength: 1, maxLength: 500 }),
  metadata: Object.freeze({
    charactersMax: 50_000_000,
    linesMax: 5_000_000,
    bytesMax: 50_000_000,
    fileExtensionMaxLength: 16,
  }),
  /** Soft ceiling for JSON body size checks (characters of raw body). */
  maxRequestBodyCharacters: 20_000,
} as const);

export type RecipeGenerationLimits = typeof RECIPE_GENERATION_LIMITS;
