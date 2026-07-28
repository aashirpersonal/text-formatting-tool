/**
 * Documented limits for Transformation Plan schema version 1.0.
 * Invalid values are rejected; nothing is silently truncated.
 */
export const PLAN_LIMITS = Object.freeze({
  title: Object.freeze({ minLength: 1, maxLength: 80 }),
  summary: Object.freeze({ minLength: 1, maxLength: 500 }),
  assumptions: Object.freeze({
    maxItems: 10,
    itemMinLength: 1,
    itemMaxLength: 300,
  }),
  warnings: Object.freeze({
    maxItems: 10,
    itemMinLength: 1,
    itemMaxLength: 300,
  }),
  operations: Object.freeze({ minItems: 1, maxItems: 25 }),
  operationId: Object.freeze({
    minLength: 1,
    maxLength: 64,
    /**
     * Safe identifier pattern: starts with a letter; then letters, digits,
     * underscore, or hyphen. Used for stable reporting — not for code eval.
     */
    pattern: /^[A-Za-z][A-Za-z0-9_-]{0,63}$/,
    patternDescription: '^[A-Za-z][A-Za-z0-9_-]{0,63}$',
  }),
  description: Object.freeze({ minLength: 1, maxLength: 240 }),
  find: Object.freeze({ minLength: 1, maxLength: 10_000 }),
  replacement: Object.freeze({ minLength: 0, maxLength: 10_000 }),
  needle: Object.freeze({ minLength: 1, maxLength: 10_000 }),
  affix: Object.freeze({ maxLength: 2_000 }),
} as const);

export type PlanLimits = typeof PLAN_LIMITS;
