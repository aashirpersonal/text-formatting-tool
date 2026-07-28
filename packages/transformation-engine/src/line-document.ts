/**
 * Line-document model that preserves LF, CRLF, lone CR, and mixed endings.
 *
 * Each logical line stores content without its terminator, plus the terminator
 * that followed it (`null` means the last line had no terminator).
 *
 * Empty input (`""`) is represented as zero lines and serialises back to `""`.
 * A document that is only a terminator (e.g. `"\n"`) is one empty line with
 * that ending.
 */

export type LineEnding = '\n' | '\r\n' | '\r';

export type LogicalLine = {
  readonly content: string;
  readonly ending: LineEnding | null;
};

export type LineDocument = {
  readonly lines: readonly LogicalLine[];
};

export function parseLineDocument(input: string): LineDocument {
  if (input.length === 0) {
    return { lines: [] };
  }

  const lines: LogicalLine[] = [];
  let start = 0;
  let i = 0;

  while (i < input.length) {
    const ch = input.charCodeAt(i);
    if (ch === 13 /* \r */) {
      if (i + 1 < input.length && input.charCodeAt(i + 1) === 10 /* \n */) {
        lines.push({ content: input.slice(start, i), ending: '\r\n' });
        i += 2;
        start = i;
        continue;
      }
      lines.push({ content: input.slice(start, i), ending: '\r' });
      i += 1;
      start = i;
      continue;
    }
    if (ch === 10 /* \n */) {
      lines.push({ content: input.slice(start, i), ending: '\n' });
      i += 1;
      start = i;
      continue;
    }
    i += 1;
  }

  if (start < input.length) {
    lines.push({ content: input.slice(start), ending: null });
  }

  return { lines };
}

export function serializeLineDocument(doc: LineDocument): string {
  let out = '';
  for (const line of doc.lines) {
    out += line.content;
    if (line.ending !== null) {
      out += line.ending;
    }
  }
  return out;
}

export function hadTrailingLineEnding(doc: LineDocument): boolean {
  if (doc.lines.length === 0) {
    return false;
  }
  return doc.lines[doc.lines.length - 1]!.ending !== null;
}

/**
 * After line-removing operations, restore the original presence/absence of a
 * final terminator on the last retained line.
 *
 * When a trailing ending must be synthesised because the retained last line
 * had `ending: null`, the preferred ending is used (defaults to LF). Mixed
 * retained endings are otherwise kept as-is.
 */
export function applyTrailingEndingPolicy(
  retained: readonly LogicalLine[],
  originalHadTrailingEnding: boolean,
  preferredEnding: LineEnding = '\n',
): LineDocument {
  if (retained.length === 0) {
    if (originalHadTrailingEnding) {
      return { lines: [{ content: '', ending: preferredEnding }] };
    }
    return { lines: [] };
  }

  const lines = retained.map((line) => ({ ...line }));
  const lastIndex = lines.length - 1;
  const last = lines[lastIndex]!;

  if (originalHadTrailingEnding) {
    if (last.ending === null) {
      lines[lastIndex] = { content: last.content, ending: preferredEnding };
    }
  } else {
    lines[lastIndex] = { content: last.content, ending: null };
  }

  return { lines };
}

/**
 * Prefer the last non-null ending from the original document for synthesised
 * trailing endings; fall back to LF.
 */
export function preferredEndingFrom(doc: LineDocument): LineEnding {
  for (let i = doc.lines.length - 1; i >= 0; i -= 1) {
    const ending = doc.lines[i]!.ending;
    if (ending !== null) {
      return ending;
    }
  }
  return '\n';
}

/**
 * Empty documents are treated as a single empty logical line with no
 * terminator for line-mutating ops that need a line to act on (trim/affix).
 */
export function ensureLogicalLines(doc: LineDocument): LineDocument {
  if (doc.lines.length === 0) {
    return { lines: [{ content: '', ending: null }] };
  }
  return doc;
}
