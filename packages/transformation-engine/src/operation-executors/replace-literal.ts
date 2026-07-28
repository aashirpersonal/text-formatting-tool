import type { ReplaceLiteralOperation } from '@tft/transformation-schema';
import type { OperationApplyResult } from '../types';

/**
 * Literal string replacement without RegExp.
 * Replacement text is inserted as-is (`$&`, `$1`, backreferences are literal).
 * Case-insensitive mode compares with toLocaleLowerCase('en-US') on both sides
 * without constructing a regular expression from plan data.
 */
export function applyReplaceLiteral(
  input: string,
  operation: ReplaceLiteralOperation,
): OperationApplyResult {
  const { find, replacement, occurrence, caseSensitive } = operation;

  if (caseSensitive) {
    if (occurrence === 'first') {
      const index = input.indexOf(find);
      if (index === -1) {
        return { output: input, changeCount: 0, warnings: [] };
      }
      const output = input.slice(0, index) + replacement + input.slice(index + find.length);
      return { output, changeCount: 1, warnings: [] };
    }

    let output = '';
    let changeCount = 0;
    let i = 0;
    while (i < input.length) {
      if (input.startsWith(find, i)) {
        output += replacement;
        i += find.length;
        changeCount += 1;
      } else {
        output += input[i]!;
        i += 1;
      }
    }
    return { output, changeCount, warnings: [] };
  }

  // Case-insensitive literal scan (no RegExp from plan content).
  const findLower = find.toLocaleLowerCase('en-US');
  const findLength = find.length;

  if (occurrence === 'first') {
    for (let i = 0; i <= input.length - findLength; i += 1) {
      const slice = input.slice(i, i + findLength);
      if (slice.toLocaleLowerCase('en-US') === findLower) {
        const output = input.slice(0, i) + replacement + input.slice(i + findLength);
        return { output, changeCount: 1, warnings: [] };
      }
    }
    return { output: input, changeCount: 0, warnings: [] };
  }

  let output = '';
  let changeCount = 0;
  let i = 0;
  while (i < input.length) {
    if (i + findLength <= input.length) {
      const slice = input.slice(i, i + findLength);
      if (slice.toLocaleLowerCase('en-US') === findLower) {
        output += replacement;
        i += findLength;
        changeCount += 1;
        continue;
      }
    }
    output += input[i]!;
    i += 1;
  }
  return { output, changeCount, warnings: [] };
}
