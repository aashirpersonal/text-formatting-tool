import { utf8ByteLength } from '@tft/transformation-engine';

export const PREVIEW_MAX_BYTES = 50 * 1024;
export const PREVIEW_MAX_LINES = 300;

export type PreviewSample = {
  readonly text: string;
  readonly truncated: boolean;
  readonly lineCount: number;
  readonly byteCount: number;
  readonly sourceLineCount: number;
  readonly sourceByteCount: number;
};

/**
 * Deterministic start-of-document preview sample.
 * Truncates by logical lines (preferring CRLF/LF/CR awareness via regex split)
 * and UTF-8 byte budget.
 */
export function buildPreviewSample(input: string): PreviewSample {
  const sourceByteCount = utf8ByteLength(input);
  if (input.length === 0) {
    return {
      text: '',
      truncated: false,
      lineCount: 0,
      byteCount: 0,
      sourceLineCount: 0,
      sourceByteCount: 0,
    };
  }

  const parts = input.split(/(\r\n|\n|\r)/);
  // parts alternate content, ending, content, ending, ...
  const lines: string[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const content = parts[i] ?? '';
    const ending = parts[i + 1] ?? '';
    lines.push(content + ending);
  }
  // If split produced a trailing empty from ending-only handling, keep as-is.
  const sourceLineCount = lines.length;

  let text = '';
  let usedLines = 0;
  let truncated = false;

  for (const line of lines) {
    if (usedLines >= PREVIEW_MAX_LINES) {
      truncated = true;
      break;
    }
    const candidate = text + line;
    if (utf8ByteLength(candidate) > PREVIEW_MAX_BYTES) {
      truncated = true;
      break;
    }
    text = candidate;
    usedLines += 1;
  }

  if (usedLines < sourceLineCount) {
    truncated = true;
  }
  if (sourceByteCount > PREVIEW_MAX_BYTES && text.length < input.length) {
    truncated = true;
  }

  return {
    text,
    truncated,
    lineCount: usedLines,
    byteCount: utf8ByteLength(text),
    sourceLineCount,
    sourceByteCount,
  };
}
