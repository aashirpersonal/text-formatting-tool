import { parseTransformationPlan, type TransformationPlan } from '@tft/transformation-schema';
import { nextOperationId } from './operation-factory';

export type RecipeTemplate = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly plan: TransformationPlan;
};

function withFreshIds(plan: TransformationPlan): TransformationPlan {
  return {
    ...plan,
    operations: plan.operations.map((operation) => ({
      ...operation,
      id: nextOperationId(operation.type.replace(/\./g, '')),
    })),
  };
}

export const RECIPE_TEMPLATES: readonly RecipeTemplate[] = Object.freeze([
  {
    id: 'clean-copied-list',
    name: 'Clean a copied list',
    description: 'Trim lines, remove blanks, and deduplicate.',
    plan: parseTransformationPlan({
      schemaVersion: '1.0',
      title: 'Clean a copied list',
      summary: 'Trim whitespace, drop empty lines, and keep unique lines.',
      assumptions: ['One item per line'],
      warnings: [],
      operations: [
        {
          id: 'tmplTrim',
          type: 'lines.trim',
          enabled: true,
          description: 'Trim each line',
          mode: 'both',
        },
        {
          id: 'tmplEmpty',
          type: 'lines.removeEmpty',
          enabled: true,
          description: 'Remove empty lines',
          whitespaceOnly: true,
        },
        {
          id: 'tmplDedupe',
          type: 'lines.dedupe',
          enabled: true,
          description: 'Remove duplicate lines',
          caseSensitive: true,
          trimBeforeCompare: false,
        },
      ],
    }),
  },
  {
    id: 'keep-error-logs',
    name: 'Keep error log lines',
    description: 'Keep lines that literally contain ERROR.',
    plan: parseTransformationPlan({
      schemaVersion: '1.0',
      title: 'Keep error log lines',
      summary: 'Filter to lines containing the literal text ERROR.',
      assumptions: ['Log lines are newline-separated'],
      warnings: [],
      operations: [
        {
          id: 'tmplFilter',
          type: 'lines.filterContains',
          enabled: true,
          description: 'Keep ERROR lines',
          needle: 'ERROR',
          caseSensitive: true,
          keep: 'matching',
        },
      ],
    }),
  },
  {
    id: 'commas-to-tabs',
    name: 'Convert commas to tabs',
    description: 'Literal replacement of commas with tab characters.',
    plan: parseTransformationPlan({
      schemaVersion: '1.0',
      title: 'Convert commas to tabs',
      summary: 'Replace every literal comma with a tab.',
      assumptions: [],
      warnings: [],
      operations: [
        {
          id: 'tmplReplace',
          type: 'replace.literal',
          enabled: true,
          description: 'Commas to tabs',
          find: ',',
          replacement: '\t',
          occurrence: 'all',
          caseSensitive: true,
        },
      ],
    }),
  },
  {
    id: 'windows-line-endings',
    name: 'Normalise Windows line endings',
    description: 'Convert line endings to CRLF.',
    plan: parseTransformationPlan({
      schemaVersion: '1.0',
      title: 'Normalise Windows line endings',
      summary: 'Convert all line endings to CRLF.',
      assumptions: [],
      warnings: [],
      operations: [
        {
          id: 'tmplCrlf',
          type: 'lineEndings.normalize',
          enabled: true,
          description: 'Use CRLF endings',
          style: 'crlf',
        },
      ],
    }),
  },
  {
    id: 'bullet-prefix',
    name: 'Add a bullet prefix',
    description: 'Prefix every line with a bullet and space.',
    plan: parseTransformationPlan({
      schemaVersion: '1.0',
      title: 'Add a bullet prefix',
      summary: 'Add a bullet prefix to every logical line.',
      assumptions: [],
      warnings: [],
      operations: [
        {
          id: 'tmplBullet',
          type: 'lines.affix',
          enabled: true,
          description: 'Bullet prefix',
          prefix: '• ',
          suffix: '',
        },
      ],
    }),
  },
]);

export function loadTemplatePlan(templateId: string): TransformationPlan {
  const template = RECIPE_TEMPLATES.find((item) => item.id === templateId);
  if (!template) {
    throw new Error(`Unknown recipe template: ${templateId}`);
  }
  return withFreshIds(structuredClone(template.plan));
}
