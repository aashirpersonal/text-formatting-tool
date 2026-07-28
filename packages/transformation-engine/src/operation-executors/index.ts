import type { TransformationOperation } from '@tft/transformation-schema';
import type { OperationApplyResult } from '../types';
import { applyLineEndingsNormalize } from './line-endings';
import {
  applyLinesAffix,
  applyLinesDedupe,
  applyLinesFilterContains,
  applyLinesRemoveEmpty,
  applyLinesTrim,
} from './lines';
import { applyReplaceLiteral } from './replace-literal';
import { applyUnicodeNormalize } from './unicode';

/**
 * Closed allowlist dispatcher. Plan `type` values cannot select arbitrary functions.
 */
export function applyOperation(
  input: string,
  operation: TransformationOperation,
): OperationApplyResult {
  switch (operation.type) {
    case 'replace.literal':
      return applyReplaceLiteral(input, operation);
    case 'lines.trim':
      return applyLinesTrim(input, operation);
    case 'lines.removeEmpty':
      return applyLinesRemoveEmpty(input, operation);
    case 'lines.dedupe':
      return applyLinesDedupe(input, operation);
    case 'lines.filterContains':
      return applyLinesFilterContains(input, operation);
    case 'lines.affix':
      return applyLinesAffix(input, operation);
    case 'lineEndings.normalize':
      return applyLineEndingsNormalize(input, operation);
    case 'unicode.normalize':
      return applyUnicodeNormalize(input, operation);
    default: {
      const _exhaustive: never = operation;
      return _exhaustive;
    }
  }
}
