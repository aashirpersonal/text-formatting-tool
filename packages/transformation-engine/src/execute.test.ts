import { describe, expect, it } from 'vitest';
import { executeTransformationPlan } from './execute';
import { basePlan } from './test-helpers';

describe('executeTransformationPlan — operations', () => {
  it('applies replace.literal without interpreting replacement metacharacters', () => {
    const plan = basePlan([
      {
        id: 'r1',
        type: 'replace.literal',
        enabled: true,
        description: 'Literal meta',
        find: 'a',
        replacement: '$&$1\\1.*[]',
        occurrence: 'all',
        caseSensitive: true,
      },
    ]);
    const result = executeTransformationPlan('a-a', plan);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.output).toBe('$&$1\\1.*[]-$&$1\\1.*[]');
      expect(result.report.operations[0]?.status).toBe('applied');
    }
  });

  it('supports first vs all and case-insensitive literal matching', () => {
    const first = executeTransformationPlan(
      'AaA',
      basePlan([
        {
          id: 'r1',
          type: 'replace.literal',
          enabled: true,
          description: 'First',
          find: 'a',
          replacement: 'x',
          occurrence: 'first',
          caseSensitive: false,
        },
      ]),
    );
    expect(first.ok && first.output).toBe('xaA');

    const all = executeTransformationPlan(
      'AaA',
      basePlan([
        {
          id: 'r1',
          type: 'replace.literal',
          enabled: true,
          description: 'All',
          find: 'a',
          replacement: 'x',
          occurrence: 'all',
          caseSensitive: false,
        },
      ]),
    );
    expect(all.ok && all.output).toBe('xxx');

    const sensitive = executeTransformationPlan(
      'AaA',
      basePlan([
        {
          id: 'r1',
          type: 'replace.literal',
          enabled: true,
          description: 'Sensitive',
          find: 'a',
          replacement: 'x',
          occurrence: 'all',
          caseSensitive: true,
        },
      ]),
    );
    expect(sensitive.ok && sensitive.output).toBe('AxA');
  });

  it('trims lines without collapsing the document as one string', () => {
    const result = executeTransformationPlan(
      '  a  \n  b  ',
      basePlan([
        {
          id: 't1',
          type: 'lines.trim',
          enabled: true,
          description: 'Trim',
          mode: 'both',
        },
      ]),
    );
    expect(result.ok && result.output).toBe('a\nb');
  });

  it('removes empty and whitespace-only lines and preserves trailing newline', () => {
    const result = executeTransformationPlan(
      'a\n  \n\nb\n',
      basePlan([
        {
          id: 'e1',
          type: 'lines.removeEmpty',
          enabled: true,
          description: 'Remove empty',
          whitespaceOnly: true,
        },
      ]),
    );
    expect(result.ok && result.output).toBe('a\nb\n');
  });

  it('dedupes preserving first occurrence and exact content', () => {
    const result = executeTransformationPlan(
      ' Apple\nApple\napple\n',
      basePlan([
        {
          id: 'd1',
          type: 'lines.dedupe',
          enabled: true,
          description: 'Dedupe',
          caseSensitive: false,
          trimBeforeCompare: true,
        },
      ]),
    );
    expect(result.ok && result.output).toBe(' Apple\n');
  });

  it('filters lines preserving order', () => {
    const result = executeTransformationPlan(
      'keep\nskip\nkeep2\n',
      basePlan([
        {
          id: 'f1',
          type: 'lines.filterContains',
          enabled: true,
          description: 'Keep',
          needle: 'keep',
          caseSensitive: true,
          keep: 'matching',
        },
      ]),
    );
    expect(result.ok && result.output).toBe('keep\nkeep2\n');
  });

  it('affixes every logical line including empty document', () => {
    const empty = executeTransformationPlan(
      '',
      basePlan([
        {
          id: 'a1',
          type: 'lines.affix',
          enabled: true,
          description: 'Affix empty',
          prefix: '[',
          suffix: ']',
        },
      ]),
    );
    expect(empty.ok && empty.output).toBe('[]');

    const lines = executeTransformationPlan(
      'a\nb',
      basePlan([
        {
          id: 'a1',
          type: 'lines.affix',
          enabled: true,
          description: 'Affix',
          prefix: '> ',
          suffix: '',
        },
      ]),
    );
    expect(lines.ok && lines.output).toBe('> a\n> b');
  });

  it('normalises mixed line endings and preserves no-trailing-newline', () => {
    const result = executeTransformationPlan(
      'a\rb\r\nc',
      basePlan([
        {
          id: 'n1',
          type: 'lineEndings.normalize',
          enabled: true,
          description: 'CRLF',
          style: 'crlf',
        },
      ]),
    );
    expect(result.ok && result.output).toBe('a\r\nb\r\nc');
  });

  it('applies unicode normalisation and warns for compatibility forms', () => {
    const nfc = executeTransformationPlan(
      'e\u0301',
      basePlan([
        {
          id: 'u1',
          type: 'unicode.normalize',
          enabled: true,
          description: 'NFC',
          form: 'NFC',
        },
      ]),
    );
    expect(nfc.ok && nfc.output).toBe('é');

    const nfkc = executeTransformationPlan(
      'ﬁ',
      basePlan([
        {
          id: 'u1',
          type: 'unicode.normalize',
          enabled: true,
          description: 'NFKC',
          form: 'NFKC',
        },
      ]),
    );
    expect(nfkc.ok).toBe(true);
    if (nfkc.ok) {
      expect(nfkc.output).toBe('fi');
      expect(nfkc.report.operations[0]?.warnings[0]).toMatch(/Compatibility/i);
    }
  });

  it('composes operations and skips disabled ones', () => {
    const result = executeTransformationPlan(
      '  a  \n  a  \n',
      basePlan([
        {
          id: 't1',
          type: 'lines.trim',
          enabled: true,
          description: 'Trim',
          mode: 'both',
        },
        {
          id: 'skip',
          type: 'lines.affix',
          enabled: false,
          description: 'Skipped',
          prefix: 'NO',
          suffix: '',
        },
        {
          id: 'd1',
          type: 'lines.dedupe',
          enabled: true,
          description: 'Dedupe',
          caseSensitive: true,
          trimBeforeCompare: false,
        },
      ]),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.output).toBe('a\n');
      expect(result.report.operations[1]?.status).toBe('skipped');
    }
  });

  it('reports no_change when operation does not alter text', () => {
    const result = executeTransformationPlan(
      'a\nb',
      basePlan([
        {
          id: 't1',
          type: 'lines.trim',
          enabled: true,
          description: 'Trim',
          mode: 'both',
        },
      ]),
    );
    expect(result.ok && result.report.operations[0]?.status).toBe('no_change');
  });
});

describe('executeTransformationPlan — limits and validation', () => {
  it('returns PLAN_INVALID without throwing', () => {
    const result = executeTransformationPlan('hi', { nope: true });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('PLAN_INVALID');
      expect(result.error.validationIssues).toBeDefined();
      expect('output' in result).toBe(false);
    }
  });

  it('enforces input, output, and operation limits', () => {
    const plan = basePlan([
      {
        id: 'a1',
        type: 'lines.affix',
        enabled: true,
        description: 'Grow',
        prefix: 'xxxx',
        suffix: '',
      },
    ]);

    const inputLimit = executeTransformationPlan('hello', plan, {
      limits: { maxInputBytes: 2 },
    });
    expect(!inputLimit.ok && inputLimit.error.code).toBe('INPUT_LIMIT_EXCEEDED');

    const outputLimit = executeTransformationPlan('hello', plan, {
      limits: { maxOutputBytes: 6 },
    });
    expect(!outputLimit.ok && outputLimit.error.code).toBe('OUTPUT_LIMIT_EXCEEDED');
    expect(!outputLimit.ok && !('output' in outputLimit)).toBe(true);

    const manyOps = basePlan(
      Array.from({ length: 3 }, (_, i) => ({
        id: `op${i}`,
        type: 'lines.trim' as const,
        enabled: true,
        description: `Trim ${i}`,
        mode: 'both' as const,
      })),
    );
    const opLimit = executeTransformationPlan('a', manyOps, {
      limits: { maxOperations: 2 },
    });
    expect(!opLimit.ok && opLimit.error.code).toBe('OPERATION_LIMIT_EXCEEDED');
  });

  it('handles empty, unicode, and emoji input', () => {
    const empty = executeTransformationPlan(
      '',
      basePlan([
        {
          id: 't1',
          type: 'lines.trim',
          enabled: true,
          description: 'Trim',
          mode: 'both',
        },
      ]),
    );
    expect(empty.ok && empty.output).toBe('');

    const emoji = executeTransformationPlan(
      '🙂a',
      basePlan([
        {
          id: 'r1',
          type: 'replace.literal',
          enabled: true,
          description: 'Replace a',
          find: 'a',
          replacement: 'b',
          occurrence: 'all',
          caseSensitive: true,
        },
      ]),
    );
    expect(emoji.ok && emoji.output).toBe('🙂b');
    if (emoji.ok) {
      expect(emoji.report.inputCharacters).toBe(2);
    }
  });

  it('preserves LF/CRLF/CR and final newline semantics through filter', () => {
    const crlf = executeTransformationPlan(
      'a\r\nb\r\n',
      basePlan([
        {
          id: 'f1',
          type: 'lines.filterContains',
          enabled: true,
          description: 'Keep a',
          needle: 'a',
          caseSensitive: true,
          keep: 'matching',
        },
      ]),
    );
    expect(crlf.ok && crlf.output).toBe('a\r\n');

    const noTrail = executeTransformationPlan(
      'a\nb',
      basePlan([
        {
          id: 'f1',
          type: 'lines.filterContains',
          enabled: true,
          description: 'Keep b',
          needle: 'b',
          caseSensitive: true,
          keep: 'matching',
        },
      ]),
    );
    expect(noTrail.ok && noTrail.output).toBe('b');
  });

  it('is deterministic and does not mutate plan or options', () => {
    const plan = basePlan([
      {
        id: 'r1',
        type: 'replace.literal',
        enabled: true,
        description: 'Swap',
        find: 'x',
        replacement: 'y',
        occurrence: 'all',
        caseSensitive: true,
      },
    ]);
    const options = { limits: { maxInputBytes: 1000 } };
    const planSnap = structuredClone(plan);
    const optionsSnap = structuredClone(options);
    const a = executeTransformationPlan('x-x', plan, options);
    const b = executeTransformationPlan('x-x', plan, options);
    expect(a).toEqual(b);
    expect(plan).toEqual(planSnap);
    expect(options).toEqual(optionsSnap);
  });

  it('line-ending normalisation and dedupe are idempotent', () => {
    const plan = basePlan([
      {
        id: 'n1',
        type: 'lineEndings.normalize',
        enabled: true,
        description: 'LF',
        style: 'lf',
      },
      {
        id: 'd1',
        type: 'lines.dedupe',
        enabled: true,
        description: 'Dedupe',
        caseSensitive: true,
        trimBeforeCompare: false,
      },
    ]);
    const first = executeTransformationPlan('a\r\na\r\n', plan);
    expect(first.ok).toBe(true);
    if (first.ok) {
      const second = executeTransformationPlan(first.output, plan);
      expect(second.ok && second.output).toBe(first.output);
    }
  });
});
