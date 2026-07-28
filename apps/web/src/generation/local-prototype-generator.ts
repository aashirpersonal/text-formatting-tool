import { parseTransformationPlan, type TransformationPlan } from '@tft/transformation-schema';
import { nextOperationId } from '@/recipes/operation-factory';
import { RECIPE_TEMPLATES, loadTemplatePlan } from '@/recipes/templates';
import type {
  ExamplePrompt,
  RecipeGenerationAdapter,
  RecipeGenerationRequest,
  RecipeGenerationResult,
} from './types';

function withFreshIds(plan: TransformationPlan): TransformationPlan {
  return {
    ...plan,
    operations: plan.operations.map((operation) => ({
      ...operation,
      id: nextOperationId(operation.type.replace(/\./g, '')),
    })),
  };
}

function normalizeInstruction(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const UNICODE_PLAN = parseTransformationPlan({
  schemaVersion: '1.0',
  title: 'Normalise Unicode',
  summary: 'Apply Unicode NFC normalisation to the whole document.',
  assumptions: [],
  warnings: [],
  operations: [
    {
      id: 'tmplUnicode',
      type: 'unicode.normalize',
      enabled: true,
      description: 'Unicode NFC',
      form: 'NFC',
    },
  ],
});

type PrototypeRecipe = {
  readonly matchers: readonly string[];
  readonly title: string;
  readonly explanation: string;
  readonly buildPlan: () => TransformationPlan;
};

const PROTOTYPE_RECIPES: readonly PrototypeRecipe[] = [
  {
    matchers: [
      'remove duplicate lines and trim spaces',
      'remove duplicate lines trim spaces',
      'trim spaces and remove duplicate lines',
      'clean a copied list',
    ],
    title: 'Clean a copied list',
    explanation: 'Trim each line, remove empty lines, and keep the first unique line.',
    buildPlan: () => loadTemplatePlan('clean-copied-list'),
  },
  {
    matchers: [
      'keep only lines containing error',
      'keep lines containing error',
      'keep error log lines',
      'filter error lines',
    ],
    title: 'Keep error log lines',
    explanation: 'Keep only lines that literally contain ERROR.',
    buildPlan: () => loadTemplatePlan('keep-error-logs'),
  },
  {
    matchers: ['replace commas with tabs', 'convert commas to tabs', 'commas to tabs'],
    title: 'Convert commas to tabs',
    explanation: 'Replace every literal comma with a tab character.',
    buildPlan: () => loadTemplatePlan('commas-to-tabs'),
  },
  {
    matchers: [
      'add a bullet to every line',
      'add bullet to every line',
      'add a bullet prefix',
      'prefix every line with a bullet',
    ],
    title: 'Add a bullet prefix',
    explanation: 'Add a bullet and space before every line.',
    buildPlan: () => loadTemplatePlan('bullet-prefix'),
  },
  {
    matchers: [
      'convert windows line endings',
      'normalise windows line endings',
      'normalize windows line endings',
      'use crlf line endings',
    ],
    title: 'Convert Windows line endings',
    explanation: 'Convert all line endings to CRLF.',
    buildPlan: () => loadTemplatePlan('windows-line-endings'),
  },
  {
    matchers: [
      'normalise unusual unicode characters',
      'normalize unusual unicode characters',
      'normalise unicode',
      'normalize unicode',
      'unicode nfc',
    ],
    title: 'Normalise Unicode',
    explanation: 'Apply Unicode NFC normalisation across the text.',
    buildPlan: () => withFreshIds(structuredClone(UNICODE_PLAN)),
  },
];

export const EXAMPLE_PROMPTS: readonly ExamplePrompt[] = Object.freeze([
  {
    id: 'clean-list',
    label: 'Remove duplicate lines and trim spaces',
    instruction: 'Remove duplicate lines and trim spaces',
  },
  {
    id: 'keep-error',
    label: 'Keep only lines containing ERROR',
    instruction: 'Keep only lines containing ERROR',
  },
  {
    id: 'commas-tabs',
    label: 'Replace commas with tabs',
    instruction: 'Replace commas with tabs',
  },
  {
    id: 'bullet',
    label: 'Add a bullet to every line',
    instruction: 'Add a bullet to every line',
  },
  {
    id: 'crlf',
    label: 'Convert Windows line endings',
    instruction: 'Convert Windows line endings',
  },
  {
    id: 'unicode',
    label: 'Normalise unusual Unicode characters',
    instruction: 'Normalise unusual Unicode characters',
  },
]);

const UNSUPPORTED_MESSAGE =
  'This prototype currently supports the example transformations above. Flexible AI instructions are coming next.';

/**
 * Development-only generator for approved example prompts.
 * Not AI. No network. Returns schema-validated Transformation Plan v1 objects only.
 */
export class LocalPrototypeRecipeGenerator implements RecipeGenerationAdapter {
  readonly modeLabel =
    'Prototype mode: example transformations only. AI generation is not connected yet.';

  async generate(request: RecipeGenerationRequest): Promise<RecipeGenerationResult> {
    const normalized = normalizeInstruction(request.instruction);
    if (!normalized) {
      return {
        ok: false,
        code: 'UNSUPPORTED_INSTRUCTION',
        message: 'Describe what should change, or choose an example above.',
      };
    }

    const match = PROTOTYPE_RECIPES.find((recipe) =>
      recipe.matchers.some((matcher) => normalized === matcher || normalized.includes(matcher)),
    );

    if (!match) {
      return {
        ok: false,
        code: 'UNSUPPORTED_INSTRUCTION',
        message: UNSUPPORTED_MESSAGE,
      };
    }

    try {
      const plan = match.buildPlan();
      return {
        ok: true,
        title: match.title,
        explanation: match.explanation,
        assumptions: plan.assumptions,
        warnings: plan.warnings,
        plan,
        prototype: true,
      };
    } catch {
      return {
        ok: false,
        code: 'INVALID_PLAN',
        message: 'The prototype could not build a valid transformation. Try an example prompt.',
      };
    }
  }
}

/** Ensures template catalogue stays aligned with prototype coverage in tests. */
export function prototypeTemplateIds(): readonly string[] {
  return RECIPE_TEMPLATES.map((item) => item.id);
}
