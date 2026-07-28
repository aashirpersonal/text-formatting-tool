import { LocalPrototypeRecipeGenerator } from './local-prototype-generator';
import { SameOriginOpenAIRecipeGenerator } from './openai-recipe-generator';
import type { PublicRecipeGeneratorStatus, RecipeGenerationAdapter } from './types';

export async function fetchRecipeGeneratorStatus(
  fetchImpl: typeof fetch = fetch,
): Promise<PublicRecipeGeneratorStatus> {
  try {
    const response = await fetchImpl('/api/recipes/generate', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
      cache: 'no-store',
    });
    if (!response.ok) {
      return { mode: 'prototype', openaiReady: false };
    }
    const json = (await response.json()) as Partial<PublicRecipeGeneratorStatus>;
    if (json.mode === 'openai') {
      return {
        mode: 'openai',
        openaiReady: Boolean(json.openaiReady),
      };
    }
    return { mode: 'prototype', openaiReady: false };
  } catch {
    return { mode: 'prototype', openaiReady: false };
  }
}

export function createRecipeGenerator(
  status: PublicRecipeGeneratorStatus,
): RecipeGenerationAdapter {
  if (status.mode === 'openai') {
    return new SameOriginOpenAIRecipeGenerator();
  }
  return new LocalPrototypeRecipeGenerator();
}
