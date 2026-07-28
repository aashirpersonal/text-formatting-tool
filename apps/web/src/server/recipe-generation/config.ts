export type RecipeGeneratorMode = 'prototype' | 'openai';

export type RecipeGeneratorRuntimeConfig = {
  readonly mode: RecipeGeneratorMode;
  readonly openaiConfigured: boolean;
  readonly modelConfigured: boolean;
  readonly modelName: string | null;
};

function readMode(raw: string | undefined): RecipeGeneratorMode {
  return raw === 'openai' ? 'openai' : 'prototype';
}

/**
 * Server-only runtime config. Never expose API keys.
 */
export function getRecipeGeneratorRuntimeConfig(
  env: Record<string, string | undefined> = process.env,
): RecipeGeneratorRuntimeConfig {
  const mode = readMode(env.RECIPE_GENERATOR_MODE);
  const modelName = env.OPENAI_MODEL?.trim() || null;
  const hasKey = Boolean(env.OPENAI_API_KEY?.trim());
  return {
    mode,
    openaiConfigured: hasKey,
    modelConfigured: Boolean(modelName),
    modelName: mode === 'openai' ? modelName : null,
  };
}

export function getPublicRecipeGeneratorStatus(
  env: Record<string, string | undefined> = process.env,
): {
  mode: RecipeGeneratorMode;
  openaiReady: boolean;
} {
  const config = getRecipeGeneratorRuntimeConfig(env);
  return {
    mode: config.mode,
    openaiReady: config.mode === 'openai' && config.openaiConfigured && config.modelConfigured,
  };
}
