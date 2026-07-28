import { describe, expect, it } from 'vitest';
import { PREVIEW_MAX_LINES, buildPreviewSample } from './preview-sample';

describe('buildPreviewSample', () => {
  it('returns full short documents without truncation', () => {
    const sample = buildPreviewSample('a\nb\n');
    expect(sample.truncated).toBe(false);
    expect(sample.text).toBe('a\nb\n');
  });

  it('truncates long line counts from the start', () => {
    const input = Array.from({ length: PREVIEW_MAX_LINES + 20 }, (_, i) => `line-${i}`).join('\n');
    const sample = buildPreviewSample(input);
    expect(sample.truncated).toBe(true);
    expect(sample.lineCount).toBe(PREVIEW_MAX_LINES);
    expect(sample.text.startsWith('line-0')).toBe(true);
  });
});
