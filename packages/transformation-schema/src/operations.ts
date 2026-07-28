import { z } from 'zod';
import { PLAN_LIMITS } from './limits.js';

const operationIdSchema = z
  .string()
  .min(PLAN_LIMITS.operationId.minLength)
  .max(PLAN_LIMITS.operationId.maxLength)
  .regex(
    PLAN_LIMITS.operationId.pattern,
    `Operation id must match ${PLAN_LIMITS.operationId.patternDescription}`,
  );

const descriptionSchema = z
  .string()
  .min(PLAN_LIMITS.description.minLength)
  .max(PLAN_LIMITS.description.maxLength);

const commonFields = {
  id: operationIdSchema,
  enabled: z.boolean(),
  description: descriptionSchema,
} as const;

export const replaceLiteralOperationSchema = z.strictObject({
  ...commonFields,
  type: z.literal('replace.literal'),
  find: z.string().min(PLAN_LIMITS.find.minLength).max(PLAN_LIMITS.find.maxLength),
  replacement: z
    .string()
    .min(PLAN_LIMITS.replacement.minLength)
    .max(PLAN_LIMITS.replacement.maxLength),
  occurrence: z.enum(['first', 'all']),
  caseSensitive: z.boolean(),
});

export const linesTrimOperationSchema = z.strictObject({
  ...commonFields,
  type: z.literal('lines.trim'),
  mode: z.enum(['start', 'end', 'both']),
});

export const linesRemoveEmptyOperationSchema = z.strictObject({
  ...commonFields,
  type: z.literal('lines.removeEmpty'),
  whitespaceOnly: z.boolean(),
});

export const linesDedupeOperationSchema = z.strictObject({
  ...commonFields,
  type: z.literal('lines.dedupe'),
  caseSensitive: z.boolean(),
  trimBeforeCompare: z.boolean(),
});

export const linesFilterContainsOperationSchema = z.strictObject({
  ...commonFields,
  type: z.literal('lines.filterContains'),
  needle: z.string().min(PLAN_LIMITS.needle.minLength).max(PLAN_LIMITS.needle.maxLength),
  caseSensitive: z.boolean(),
  keep: z.enum(['matching', 'nonMatching']),
});

export const linesAffixOperationSchema = z
  .strictObject({
    ...commonFields,
    type: z.literal('lines.affix'),
    prefix: z.string().max(PLAN_LIMITS.affix.maxLength),
    suffix: z.string().max(PLAN_LIMITS.affix.maxLength),
  })
  .superRefine((value, ctx) => {
    if (value.prefix.length === 0 && value.suffix.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'lines.affix requires a non-empty prefix and/or suffix',
        path: ['prefix'],
      });
    }
  });

export const lineEndingsNormalizeOperationSchema = z.strictObject({
  ...commonFields,
  type: z.literal('lineEndings.normalize'),
  style: z.enum(['lf', 'crlf']),
});

export const unicodeNormalizeOperationSchema = z.strictObject({
  ...commonFields,
  type: z.literal('unicode.normalize'),
  form: z.enum(['NFC', 'NFD', 'NFKC', 'NFKD']),
});

export const transformationOperationSchema = z.discriminatedUnion('type', [
  replaceLiteralOperationSchema,
  linesTrimOperationSchema,
  linesRemoveEmptyOperationSchema,
  linesDedupeOperationSchema,
  linesFilterContainsOperationSchema,
  linesAffixOperationSchema,
  lineEndingsNormalizeOperationSchema,
  unicodeNormalizeOperationSchema,
]);

export type ReplaceLiteralOperation = z.infer<typeof replaceLiteralOperationSchema>;
export type LinesTrimOperation = z.infer<typeof linesTrimOperationSchema>;
export type LinesRemoveEmptyOperation = z.infer<typeof linesRemoveEmptyOperationSchema>;
export type LinesDedupeOperation = z.infer<typeof linesDedupeOperationSchema>;
export type LinesFilterContainsOperation = z.infer<typeof linesFilterContainsOperationSchema>;
export type LinesAffixOperation = z.infer<typeof linesAffixOperationSchema>;
export type LineEndingsNormalizeOperation = z.infer<typeof lineEndingsNormalizeOperationSchema>;
export type UnicodeNormalizeOperation = z.infer<typeof unicodeNormalizeOperationSchema>;
export type TransformationOperation = z.infer<typeof transformationOperationSchema>;

export const OPERATION_TYPES = Object.freeze([
  'replace.literal',
  'lines.trim',
  'lines.removeEmpty',
  'lines.dedupe',
  'lines.filterContains',
  'lines.affix',
  'lineEndings.normalize',
  'unicode.normalize',
] as const);

export type OperationType = (typeof OPERATION_TYPES)[number];
