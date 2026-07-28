import type { LineEndingsNormalizeOperation } from '@tft/transformation-schema';
import { parseLineDocument, serializeLineDocument, type LineEnding } from '../line-document.js';
import type { OperationApplyResult } from '../types.js';

export function applyLineEndingsNormalize(
  input: string,
  operation: LineEndingsNormalizeOperation,
): OperationApplyResult {
  const doc = parseLineDocument(input);
  const ending: LineEnding = operation.style === 'crlf' ? '\r\n' : '\n';
  let changeCount = 0;

  const lines = doc.lines.map((line) => {
    if (line.ending === null) {
      return line;
    }
    if (line.ending !== ending) {
      changeCount += 1;
      return { content: line.content, ending };
    }
    return line;
  });

  const output = serializeLineDocument({ lines });
  return { output, changeCount, warnings: [] };
}
