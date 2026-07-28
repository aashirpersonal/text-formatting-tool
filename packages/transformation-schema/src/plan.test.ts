import { describe, expect, it } from 'vitest';
import {
  PLAN_LIMITS,
  TRANSFORMATION_PLAN_SCHEMA_VERSION,
  getTransformationPlanJsonSchema,
  parseTransformationPlan,
  safeParseTransformationPlan,
  transformationPlanJsonSchema,
  transformationPlanSchema,
} from './index';
import { validPlan } from './test-helpers';

describe('Transformation Plan v1 schema', () => {
  it('accepts a valid complete plan', () => {
    const plan = validPlan({
      operations: [
        {
          id: 'r1',
          type: 'replace.literal',
          enabled: true,
          description: 'Replace commas',
          find: ',',
          replacement: '\t',
          occurrence: 'all',
          caseSensitive: true,
        },
        {
          id: 't1',
          type: 'lines.trim',
          enabled: true,
          description: 'Trim lines',
          mode: 'both',
        },
        {
          id: 'e1',
          type: 'lines.removeEmpty',
          enabled: true,
          description: 'Drop blanks',
          whitespaceOnly: true,
        },
        {
          id: 'd1',
          type: 'lines.dedupe',
          enabled: true,
          description: 'Dedupe',
          caseSensitive: true,
          trimBeforeCompare: false,
        },
        {
          id: 'f1',
          type: 'lines.filterContains',
          enabled: true,
          description: 'Keep errors',
          needle: 'ERROR',
          caseSensitive: true,
          keep: 'matching',
        },
        {
          id: 'a1',
          type: 'lines.affix',
          enabled: true,
          description: 'Prefix rows',
          prefix: '> ',
          suffix: '',
        },
        {
          id: 'n1',
          type: 'lineEndings.normalize',
          enabled: true,
          description: 'LF endings',
          style: 'lf',
        },
        {
          id: 'u1',
          type: 'unicode.normalize',
          enabled: true,
          description: 'NFC',
          form: 'NFC',
        },
      ],
    });
    const parsed = parseTransformationPlan(plan);
    expect(parsed.schemaVersion).toBe(TRANSFORMATION_PLAN_SCHEMA_VERSION);
    expect(parsed.operations).toHaveLength(8);
  });

  it('rejects wrong schema version', () => {
    const result = safeParseTransformationPlan({
      ...validPlan(),
      schemaVersion: '2.0',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing fields', () => {
    const { title: _title, ...rest } = validPlan();
    expect(safeParseTransformationPlan(rest).success).toBe(false);
  });

  it('rejects unknown plan fields', () => {
    expect(safeParseTransformationPlan({ ...validPlan(), extra: true }).success).toBe(false);
  });

  it('rejects unknown operation fields', () => {
    const plan = validPlan({
      operations: [
        {
          id: 'op1',
          type: 'lines.trim',
          enabled: true,
          description: 'Trim',
          mode: 'both',
          code: 'alert(1)',
        } as never,
      ],
    });
    expect(safeParseTransformationPlan(plan).success).toBe(false);
  });

  it('rejects unknown operation type', () => {
    const plan = validPlan({
      operations: [
        {
          id: 'op1',
          type: 'eval.script',
          enabled: true,
          description: 'Nope',
        } as never,
      ],
    });
    expect(safeParseTransformationPlan(plan).success).toBe(false);
  });

  it('rejects empty and excessive titles', () => {
    expect(safeParseTransformationPlan(validPlan({ title: '' })).success).toBe(false);
    expect(
      safeParseTransformationPlan(validPlan({ title: 'x'.repeat(PLAN_LIMITS.title.maxLength + 1) }))
        .success,
    ).toBe(false);
  });

  it('rejects excessive summary', () => {
    expect(
      safeParseTransformationPlan(
        validPlan({ summary: 's'.repeat(PLAN_LIMITS.summary.maxLength + 1) }),
      ).success,
    ).toBe(false);
  });

  it('rejects excessive assumption and warning counts', () => {
    expect(
      safeParseTransformationPlan(
        validPlan({
          assumptions: Array.from({ length: 11 }, (_, i) => `a${i}`),
        }),
      ).success,
    ).toBe(false);
    expect(
      safeParseTransformationPlan(
        validPlan({
          warnings: Array.from({ length: 11 }, (_, i) => `w${i}`),
        }),
      ).success,
    ).toBe(false);
  });

  it('rejects zero and excessive operations', () => {
    expect(safeParseTransformationPlan(validPlan({ operations: [] })).success).toBe(false);
    const ops = Array.from({ length: 26 }, (_, i) => ({
      id: `op${i}`,
      type: 'lines.trim' as const,
      enabled: true,
      description: `Trim ${i}`,
      mode: 'both' as const,
    }));
    expect(safeParseTransformationPlan(validPlan({ operations: ops })).success).toBe(false);
  });

  it('rejects duplicate operation ids', () => {
    const result = safeParseTransformationPlan(
      validPlan({
        operations: [
          {
            id: 'same',
            type: 'lines.trim',
            enabled: true,
            description: 'One',
            mode: 'both',
          },
          {
            id: 'same',
            type: 'lines.trim',
            enabled: true,
            description: 'Two',
            mode: 'start',
          },
        ],
      }),
    );
    expect(result.success).toBe(false);
  });

  it('rejects invalid operation ids', () => {
    expect(
      safeParseTransformationPlan(
        validPlan({
          operations: [
            {
              id: '1bad',
              type: 'lines.trim',
              enabled: true,
              description: 'Bad id',
              mode: 'both',
            },
          ],
        }),
      ).success,
    ).toBe(false);
  });

  it('rejects empty find and needle and empty affix pair', () => {
    expect(
      safeParseTransformationPlan(
        validPlan({
          operations: [
            {
              id: 'r1',
              type: 'replace.literal',
              enabled: true,
              description: 'Empty find',
              find: '',
              replacement: 'x',
              occurrence: 'all',
              caseSensitive: true,
            },
          ],
        }),
      ).success,
    ).toBe(false);

    expect(
      safeParseTransformationPlan(
        validPlan({
          operations: [
            {
              id: 'f1',
              type: 'lines.filterContains',
              enabled: true,
              description: 'Empty needle',
              needle: '',
              caseSensitive: true,
              keep: 'matching',
            },
          ],
        }),
      ).success,
    ).toBe(false);

    expect(
      safeParseTransformationPlan(
        validPlan({
          operations: [
            {
              id: 'a1',
              type: 'lines.affix',
              enabled: true,
              description: 'Empty affix',
              prefix: '',
              suffix: '',
            },
          ],
        }),
      ).success,
    ).toBe(false);
  });

  it('rejects invalid enum values', () => {
    expect(
      safeParseTransformationPlan(
        validPlan({
          operations: [
            {
              id: 't1',
              type: 'lines.trim',
              enabled: true,
              description: 'Bad mode',
              mode: 'middle',
            } as never,
          ],
        }),
      ).success,
    ).toBe(false);
  });

  it('exports JSON Schema with additionalProperties false', () => {
    const schema = getTransformationPlanJsonSchema();
    expect(schema).toBe(transformationPlanJsonSchema);
    expect(schema.additionalProperties).toBe(false);
    expect(JSON.stringify(schema)).toContain('replace.literal');
  });

  it('does not mutate input objects during parsing', () => {
    const input = validPlan();
    const snapshot = structuredClone(input);
    parseTransformationPlan(input);
    expect(input).toEqual(snapshot);
    expect(transformationPlanSchema.safeParse(input).success).toBe(true);
  });
});
