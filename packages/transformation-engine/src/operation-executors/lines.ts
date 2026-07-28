import type {
  LinesAffixOperation,
  LinesDedupeOperation,
  LinesFilterContainsOperation,
  LinesRemoveEmptyOperation,
  LinesTrimOperation,
} from '@tft/transformation-schema';
import {
  applyTrailingEndingPolicy,
  ensureLogicalLines,
  parseLineDocument,
  preferredEndingFrom,
  serializeLineDocument,
  type LogicalLine,
} from '../line-document';
import type { OperationApplyResult } from '../types';

export function applyLinesTrim(input: string, operation: LinesTrimOperation): OperationApplyResult {
  const doc = ensureLogicalLines(parseLineDocument(input));
  const lines = doc.lines.map((line) => {
    let content = line.content;
    if (operation.mode === 'start' || operation.mode === 'both') {
      content = content.replace(/^\s+/, '');
    }
    if (operation.mode === 'end' || operation.mode === 'both') {
      content = content.replace(/\s+$/, '');
    }
    return { content, ending: line.ending };
  });
  const output = serializeLineDocument({ lines });
  let changedLines = 0;
  for (let i = 0; i < doc.lines.length; i += 1) {
    if (doc.lines[i]!.content !== lines[i]!.content) {
      changedLines += 1;
    }
  }
  return { output, changeCount: changedLines, warnings: [] };
}

export function applyLinesRemoveEmpty(
  input: string,
  operation: LinesRemoveEmptyOperation,
): OperationApplyResult {
  const doc = parseLineDocument(input);
  if (doc.lines.length === 0) {
    return { output: input, changeCount: 0, warnings: [] };
  }

  const originalTrailing = doc.lines[doc.lines.length - 1]!.ending !== null;
  const preferred = preferredEndingFrom(doc);

  const retained = doc.lines.filter((line) => {
    if (operation.whitespaceOnly) {
      return line.content.trim().length > 0;
    }
    return line.content.length > 0;
  });

  const next = applyTrailingEndingPolicy(retained, originalTrailing, preferred);
  const output = serializeLineDocument(next);
  const removed = doc.lines.length - retained.length;
  return { output, changeCount: removed, warnings: [] };
}

export function applyLinesDedupe(
  input: string,
  operation: LinesDedupeOperation,
): OperationApplyResult {
  const doc = parseLineDocument(input);
  if (doc.lines.length === 0) {
    return { output: input, changeCount: 0, warnings: [] };
  }

  const originalTrailing = doc.lines[doc.lines.length - 1]!.ending !== null;
  const preferred = preferredEndingFrom(doc);
  const seen = new Set<string>();
  const retained: LogicalLine[] = [];
  let removed = 0;

  for (const line of doc.lines) {
    let key = line.content;
    if (operation.trimBeforeCompare) {
      key = key.trim();
    }
    if (!operation.caseSensitive) {
      key = key.toLocaleLowerCase('en-US');
    }
    if (seen.has(key)) {
      removed += 1;
      continue;
    }
    seen.add(key);
    retained.push(line);
  }

  const next = applyTrailingEndingPolicy(retained, originalTrailing, preferred);
  const output = serializeLineDocument(next);
  return { output, changeCount: removed, warnings: [] };
}

export function applyLinesFilterContains(
  input: string,
  operation: LinesFilterContainsOperation,
): OperationApplyResult {
  const doc = parseLineDocument(input);
  if (doc.lines.length === 0) {
    return { output: input, changeCount: 0, warnings: [] };
  }

  const originalTrailing = doc.lines[doc.lines.length - 1]!.ending !== null;
  const preferred = preferredEndingFrom(doc);
  const needle = operation.caseSensitive
    ? operation.needle
    : operation.needle.toLocaleLowerCase('en-US');

  const retained = doc.lines.filter((line) => {
    const haystack = operation.caseSensitive
      ? line.content
      : line.content.toLocaleLowerCase('en-US');
    const matches = haystack.includes(needle);
    return operation.keep === 'matching' ? matches : !matches;
  });

  const next = applyTrailingEndingPolicy(retained, originalTrailing, preferred);
  const output = serializeLineDocument(next);
  const removed = doc.lines.length - retained.length;
  return { output, changeCount: removed, warnings: [] };
}

export function applyLinesAffix(
  input: string,
  operation: LinesAffixOperation,
): OperationApplyResult {
  const doc = ensureLogicalLines(parseLineDocument(input));
  const lines = doc.lines.map((line) => ({
    content: `${operation.prefix}${line.content}${operation.suffix}`,
    ending: line.ending,
  }));
  const output = serializeLineDocument({ lines });
  const changeCount =
    output === input
      ? 0
      : operation.prefix.length > 0 || operation.suffix.length > 0
        ? lines.length
        : 0;
  return {
    output,
    changeCount,
    warnings: [],
  };
}
