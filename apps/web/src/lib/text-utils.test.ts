import { describe, expect, it } from 'vitest';
import { countCharacters, countLines, validatePlainTextFile } from './text-utils';

describe('text utilities', () => {
  it('counts Unicode characters safely', () => {
    expect(countCharacters('hi')).toBe(2);
    expect(countCharacters('🙂a')).toBe(2);
  });

  it('counts lines including trailing newline segments', () => {
    expect(countLines('')).toBe(0);
    expect(countLines('one')).toBe(1);
    expect(countLines('one\ntwo')).toBe(2);
    expect(countLines('one\n')).toBe(2);
  });

  it('validates plain-text files', () => {
    const ok = validatePlainTextFile(new File(['hello'], 'notes.txt', { type: 'text/plain' }));
    expect(ok.ok).toBe(true);

    const bad = validatePlainTextFile(new File(['x'], 'photo.png', { type: 'image/png' }));
    expect(bad.ok).toBe(false);
  });
});
