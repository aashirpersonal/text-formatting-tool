import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3000);
// Prefer localhost over 127.0.0.1: Next.js 16 Turbopack currently fails to
// hydrate the app shell when Playwright loads 127.0.0.1 (no React fiber on
// [data-testid="app-root"]), while localhost hydrates normally.
const host = process.env.PLAYWRIGHT_HOST ?? 'localhost';
const baseURL = `http://${host}:${port}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    // Force prototype mode so founder .env.local OpenAI settings cannot make
    // deterministic UI e2e depend on a live provider or sample-review gating.
    command: `npm run dev -- --hostname ${host} --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      RECIPE_GENERATOR_MODE: 'prototype',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
