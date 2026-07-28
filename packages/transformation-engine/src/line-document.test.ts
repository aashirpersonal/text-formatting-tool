import { describe, expect, it } from 'vitest';
import {
  applyTrailingEndingPolicy,
  parseLineDocument,
  serializeLineDocument,
} from './line-document';

describe('line document model', () => {
  it('round-trips LF, CRLF, CR, and mixed endings', () => {
    const samples = ['a\nb\n', 'a\r\nb\r\n', 'a\rb\r', 'a\nb\r\nc\rd', 'a', '', '\n', '\r\n'];
    for (const sample of samples) {
      expect(serializeLineDocument(parseLineDocument(sample))).toBe(sample);
    }
  });

  it('preserves leading and trailing empty lines', () => {
    const input = '\n\na\n\n';
    const doc = parseLineDocument(input);
    expect(doc.lines.map((l) => l.content)).toEqual(['', '', 'a', '']);
    expect(doc.lines.map((l) => l.ending)).toEqual(['\n', '\n', '\n', '\n']);
    expect(serializeLineDocument(doc)).toBe(input);
  });

  it('distinguishes final newline presence', () => {
    const withNl = parseLineDocument('a\nb\n');
    const without = parseLineDocument('a\nb');
    expect(withNl.lines.at(-1)?.ending).toBe('\n');
    expect(without.lines.at(-1)?.ending).toBeNull();
  });

  it('applyTrailingEndingPolicy restores trailing semantics', () => {
    const retained = [
      { content: 'a', ending: '\n' as const },
      { content: 'b', ending: null },
    ];
    const withTrailing = applyTrailingEndingPolicy(retained, true, '\n');
    expect(serializeLineDocument(withTrailing)).toBe('a\nb\n');
    const withoutTrailing = applyTrailingEndingPolicy(retained, false, '\n');
    expect(serializeLineDocument(withoutTrailing)).toBe('a\nb');
  });
});
