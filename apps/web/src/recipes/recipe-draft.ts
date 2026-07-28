import {
  TRANSFORMATION_PLAN_SCHEMA_VERSION,
  safeParseTransformationPlan,
  type TransformationOperation,
  type TransformationPlan,
} from '@tft/transformation-schema';

export type RecipeDraft = {
  title: string;
  summary: string;
  assumptions: string[];
  warnings: string[];
  operations: TransformationOperation[];
};

export function createEmptyRecipeDraft(): RecipeDraft {
  return {
    title: 'Untitled recipe',
    summary: 'Manual local transformation recipe.',
    assumptions: [],
    warnings: [],
    operations: [],
  };
}

export function draftToPlanCandidate(draft: RecipeDraft): unknown {
  return {
    schemaVersion: TRANSFORMATION_PLAN_SCHEMA_VERSION,
    title: draft.title,
    summary: draft.summary,
    assumptions: draft.assumptions,
    warnings: draft.warnings,
    operations: draft.operations,
  };
}

export function planToDraft(plan: TransformationPlan): RecipeDraft {
  return {
    title: plan.title,
    summary: plan.summary,
    assumptions: [...plan.assumptions],
    warnings: [...plan.warnings],
    operations: structuredClone(plan.operations),
  };
}

export type RecipeValidation =
  | { readonly ok: true; readonly plan: TransformationPlan }
  | {
      readonly ok: false;
      readonly issues: readonly { readonly path: string; readonly message: string }[];
    };

export function validateRecipeDraft(draft: RecipeDraft): RecipeValidation {
  const parsed = safeParseTransformationPlan(draftToPlanCandidate(draft));
  if (parsed.success) {
    return { ok: true, plan: parsed.data };
  }
  return {
    ok: false,
    issues: parsed.error.issues.map((issue) => ({
      path: issue.path.length > 0 ? issue.path.join('.') : '(plan)',
      message: issue.message,
    })),
  };
}
