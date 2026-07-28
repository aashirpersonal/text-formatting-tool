import type { UnicodeNormalizeOperation } from '@tft/transformation-schema';
import type { OperationApplyResult } from '../types';

/**
 * Uses String.prototype.normalize.
 * NFC/NFD are canonical forms. NFKC/NFKD are compatibility forms and may
 * fold characters (e.g. ﬁ → fi). This is not spelling correction or translation.
 */
export function applyUnicodeNormalize(
  input: string,
  operation: UnicodeNormalizeOperation,
): OperationApplyResult {
  const output = input.normalize(operation.form);
  return {
    output,
    changeCount: output === input ? 0 : 1,
    warnings:
      operation.form === 'NFKC' || operation.form === 'NFKD'
        ? [
            'Compatibility normalisation (NFKC/NFKD) may fold or expand characters; it is not semantic translation.',
          ]
        : [],
  };
}
