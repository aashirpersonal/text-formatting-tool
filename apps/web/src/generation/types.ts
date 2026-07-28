import type { TransformationPlan } from '@tft/transformation-schema';
import type { DocumentSample } from './select-document-samples';

export type RecipeGenerationRequest = {
  readonly instruction: string;
  readonly samples?: readonly DocumentSample[];
  readonly documentMetadata?: {
    readonly characters: number;
    readonly lines: number;
    readonly bytes: number;
    readonly fileExtension?: string;
  };
  readonly signal?: AbortSignal;
};

export type RecipeGenerationSuccess = {
  readonly ok: true;
  readonly title: string;
  readonly explanation: string;
  readonly assumptions: readonly string[];
  readonly warnings: readonly string[];
  readonly plan: TransformationPlan;
  readonly prototype: boolean;
};

export type RecipeGenerationFailureCode =
  | 'UNSUPPORTED_INSTRUCTION'
  | 'INVALID_PLAN'
  | 'RATE_LIMITED'
  | 'CONFIGURATION_UNAVAILABLE'
  | 'VALIDATION_FAILED'
  | 'PROVIDER_FAILURE'
  | 'CANCELLED'
  | 'TIMEOUT';

export type RecipeGenerationFailure = {
  readonly ok: false;
  readonly code: RecipeGenerationFailureCode;
  readonly message: string;
};

export type RecipeGenerationResult = RecipeGenerationSuccess | RecipeGenerationFailure;

/**
 * Generators return schema-valid plans only — never executable code.
 */
export interface RecipeGenerationAdapter {
  readonly modeLabel: string;
  readonly requiresSampleReview: boolean;
  generate(request: RecipeGenerationRequest): Promise<RecipeGenerationResult>;
}

export type ExamplePrompt = {
  readonly id: string;
  readonly label: string;
  readonly instruction: string;
};

export type PublicRecipeGeneratorStatus = {
  readonly mode: 'prototype' | 'openai';
  readonly openaiReady: boolean;
};
