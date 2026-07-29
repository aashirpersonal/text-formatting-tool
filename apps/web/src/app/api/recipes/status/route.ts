import { NextResponse } from 'next/server';
import { getPublicRecipeGeneratorStatus } from '@/server/recipe-generation/config';

export const runtime = 'nodejs';

/**
 * Public recipe-generator mode status only.
 * Never returns secrets and never calls the provider.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(getPublicRecipeGeneratorStatus(), {
    headers: { 'Cache-Control': 'no-store' },
  });
}
