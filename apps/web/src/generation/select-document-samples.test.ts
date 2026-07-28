import { describe, expect, it } from 'vitest';
import { selectDocumentSamples } from './select-document-samples';

describe('selectDocumentSamples', () => {
  it('returns a single full excerpt for short text', () => {
    const samples = selectDocumentSamples('a\nb');
    expect(samples).toEqual([{ id: 'full', label: 'Full document', text: 'a\nb' }]);
  });

  it('selects start middle and end for long text', () => {
    const lines = Array.from({ length: 300 }, (_, index) => `line-content-${index}-padding`);
    const text = lines.join('\n');
    expect(text.length).toBeGreaterThan(2000);
    const samples = selectDocumentSamples(text);
    expect(samples.length).toBeGreaterThanOrEqual(2);
    expect(samples[0]?.id).toBe('start');
    expect(samples.some((sample) => sample.id === 'end')).toBe(true);
    expect(samples.every((sample) => sample.text.length <= 2000)).toBe(true);
    const total = samples.reduce((sum, sample) => sum + sample.text.length, 0);
    expect(total).toBeLessThanOrEqual(5000);
  });

  it('avoids duplicate excerpts', () => {
    const text = `${'same\n'.repeat(40)}`;
    const samples = selectDocumentSamples(text, {
      maxSampleCharacters: 20,
      maxTotalCharacters: 60,
    });
    const unique = new Set(samples.map((sample) => sample.text));
    expect(unique.size).toBe(samples.length);
  });

  it('respects LF CRLF and lone CR', () => {
    const lf = selectDocumentSamples('one\ntwo\nthree');
    const crlf = selectDocumentSamples('one\r\ntwo\r\nthree');
    const cr = selectDocumentSamples('one\rtwo\rthree');
    expect(lf[0]?.text).toContain('one');
    expect(crlf[0]?.text).toContain('one');
    expect(cr[0]?.text).toContain('one');
  });

  it('is deterministic and does not mutate input', () => {
    const lines = Array.from({ length: 300 }, (_, index) => `row-content-${index}-padding`);
    const text = lines.join('\n');
    const frozen = text;
    const a = selectDocumentSamples(text);
    const b = selectDocumentSamples(text);
    expect(a).toEqual(b);
    expect(text).toBe(frozen);
  });

  it('returns empty for empty documents', () => {
    expect(selectDocumentSamples('')).toEqual([]);
    expect(selectDocumentSamples('   \n  ')).toEqual([]);
  });
});
