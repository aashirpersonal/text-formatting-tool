import { describe, expect, it, vi } from 'vitest';
import { MAX_INPUT_BYTES, countCharacters, countLines, validatePlainTextFile } from './text-utils';

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

  it('rejects oversized files before contents are read', () => {
    const textFn = vi.fn(async () => 'should-not-load');
    const file = {
      name: 'huge.txt',
      type: 'text/plain',
      size: MAX_INPUT_BYTES + 1,
      text: textFn,
    } as unknown as File;
    const result = validatePlainTextFile(file, MAX_INPUT_BYTES);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toMatch(/larger than the 10 MiB/i);
    }
    expect(textFn).not.toHaveBeenCalled();
  });
});
