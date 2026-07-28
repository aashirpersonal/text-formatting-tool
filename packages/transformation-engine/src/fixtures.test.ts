import { describe, expect, it } from 'vitest';
import { executeTransformationPlan } from './execute.js';
import { basePlan } from './test-helpers.js';

describe('representative fixtures', () => {
  it('normalises a copied list', () => {
    const input = '  apples  \r\n\r\n  bananas  \r\n  apples  \r\n';
    const plan = basePlan([
      {
        id: 'trim',
        type: 'lines.trim',
        enabled: true,
        description: 'Trim',
        mode: 'both',
      },
      {
        id: 'empty',
        type: 'lines.removeEmpty',
        enabled: true,
        description: 'Remove blanks',
        whitespaceOnly: true,
      },
      {
        id: 'dedupe',
        type: 'lines.dedupe',
        enabled: true,
        description: 'Unique',
        caseSensitive: true,
        trimBeforeCompare: false,
      },
      {
        id: 'lf',
        type: 'lineEndings.normalize',
        enabled: true,
        description: 'LF',
        style: 'lf',
      },
    ]);
    const result = executeTransformationPlan(input, plan);
    expect(result.ok && result.output).toBe('apples\nbananas\n');
  });

  it('removes duplicate product labels', () => {
    const input = 'SKU-1 Widget\nSKU-1 Widget\nSKU-2 Gadget\n';
    const result = executeTransformationPlan(
      input,
      basePlan([
        {
          id: 'dedupe',
          type: 'lines.dedupe',
          enabled: true,
          description: 'Dedupe labels',
          caseSensitive: true,
          trimBeforeCompare: true,
        },
      ]),
    );
    expect(result.ok && result.output).toBe('SKU-1 Widget\nSKU-2 Gadget\n');
  });

  it('filters log lines', () => {
    const input = 'INFO ok\nERROR boom\nDEBUG x\nERROR again\n';
    const result = executeTransformationPlan(
      input,
      basePlan([
        {
          id: 'errors',
          type: 'lines.filterContains',
          enabled: true,
          description: 'Errors only',
          needle: 'ERROR',
          caseSensitive: true,
          keep: 'matching',
        },
      ]),
    );
    expect(result.ok && result.output).toBe('ERROR boom\nERROR again\n');
  });

  it('converts mixed line endings', () => {
    const result = executeTransformationPlan(
      'one\rtwo\r\nthree\n',
      basePlan([
        {
          id: 'crlf',
          type: 'lineEndings.normalize',
          enabled: true,
          description: 'CRLF',
          style: 'crlf',
        },
      ]),
    );
    expect(result.ok && result.output).toBe('one\r\ntwo\r\nthree\r\n');
  });

  it('replaces delimiters literally', () => {
    const result = executeTransformationPlan(
      'a,b,c',
      basePlan([
        {
          id: 'delim',
          type: 'replace.literal',
          enabled: true,
          description: 'Commas to tabs',
          find: ',',
          replacement: '\t',
          occurrence: 'all',
          caseSensitive: true,
        },
      ]),
    );
    expect(result.ok && result.output).toBe('a\tb\tc');
  });
});
