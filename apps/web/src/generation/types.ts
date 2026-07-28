import type { TransformationPlan } from '@tft/transformation-schema';

export type RecipeGenerationRequest = {
  readonly instruction: string;
};

export type RecipeGenerationSuccess = {
  readonly ok: true;
  readonly title: string;
  readonly explanation: string;
  readonly assumptions: readonly string[];
  readonly warnings: readonly string[];
  readonly plan: TransformationPlan;
  readonly prototype: true;
};

export type RecipeGenerationFailure = {
  readonly ok: false;
  readonly code: 'UNSUPPORTED_INSTRUCTION' | 'INVALID_PLAN';
  readonly message: string;
};

export type RecipeGenerationResult = RecipeGenerationSuccess | RecipeGenerationFailure;

/**
 * Future AI generators implement this boundary.
 * Implementations must return schema-valid plans only — never executable code.
 */
export interface RecipeGenerationAdapter {
  readonly modeLabel: string;
  generate(request: RecipeGenerationRequest): Promise<RecipeGenerationResult>;
}

export type ExamplePrompt = {
  readonly id: string;
  readonly label: string;
  readonly instruction: string;
};
