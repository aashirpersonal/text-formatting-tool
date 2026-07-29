import { expect, test } from '@playwright/test';

/**
 * Phase D verification: UI + Worker flow using the exact live provider plan
 * from the controlled smoke test. The POST is mocked with that plan to avoid
 * a second paid provider call; the request body still comes from the real page.
 */
const liveProviderResponse = {
  ok: true,
  result: {
    version: '1.0',
    outcome: 'plan',
    message:
      'Plan to trim leading/trailing whitespace from each line, then remove duplicate lines (keeping the first occurrence).',
    plan: {
      schemaVersion: '1.0',
      title: 'Trim whitespace and remove duplicate lines',
      summary:
        '1) Trim leading and trailing whitespace from every line. 2) Remove duplicate lines, keeping the first occurrence. Duplicate comparison is case-sensitive by default.',
      assumptions: [
        'Input is a plain text document with lines separated by newline characters.',
        'Trim removes only leading and trailing whitespace; internal spacing within lines is preserved.',
        'Duplicate detection compares full line content after the trim step.',
        'The plan preserves the original line order except that later duplicate lines are removed.',
      ],
      warnings: [
        'Duplicate detection is case-sensitive. If you want case-insensitive deduplication, set caseSensitive to false.',
        'Lines that become empty after trimming are considered valid lines; repeated empty lines will be deduplicated (keeping the first empty line).',
        'This plan describes deterministic text transformations; it does not process or return the full document content.',
      ],
      operations: [
        {
          id: 'op1',
          enabled: true,
          description: 'Trim leading and trailing whitespace from each line.',
          type: 'lines.trim',
          mode: 'both',
        },
        {
          id: 'op2',
          enabled: true,
          description:
            'Remove duplicate lines, keeping the first occurrence (case-sensitive comparison).',
          type: 'lines.dedupe',
          caseSensitive: true,
          trimBeforeCompare: false,
        },
      ],
    },
  },
};

test('phase D: live plan preview/apply without full-document upload', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1280, height: 800 });

  await page.addInitScript((response) => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(typeof input === 'string' || input instanceof URL ? input : input.url);
      if (!url.includes('/api/recipes/generate') && !url.includes('/api/recipes/status')) {
        return originalFetch(input, init);
      }
      const method = (init?.method ?? 'GET').toUpperCase();
      if (method === 'GET' || url.includes('/api/recipes/status')) {
        return new Response(JSON.stringify({ mode: 'openai', openaiReady: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        });
      }
      const body = String(init?.body ?? '');
      const store = window as unknown as {
        __tftPostedBodies?: string[];
        __tftAppRequests?: string[];
      };
      store.__tftPostedBodies = [...(store.__tftPostedBodies ?? []), body];
      store.__tftAppRequests = [...(store.__tftAppRequests ?? []), `${method} ${url}`];
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    };
  }, liveProviderResponse);

  await page.goto('/app', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => {
    const root = document.querySelector('[data-testid="app-root"]');
    return Boolean(root && Object.keys(root).some((key) => key.startsWith('__reactFiber')));
  });
  await page.getByTestId('document-input').fill('apple\napple\nbanana');
  await page.getByTestId('instruction-input').fill('Remove duplicate lines and trim spaces.');
  await expect(page.getByTestId('generate-transformation')).toBeEnabled();
  await page.getByTestId('generate-transformation').click();
  await expect(page.getByTestId('sample-review')).toBeVisible();
  await expect(page.getByTestId('sample-review')).toContainText('apple');
  await page.getByTestId('generate-safely').click();
  await expect(page.getByTestId('generation-summary')).toBeVisible();

  const postedBodies = await page.evaluate(
    () => (window as unknown as { __tftPostedBodies?: string[] }).__tftPostedBodies ?? [],
  );
  expect(postedBodies.length).toBe(1);
  const parsed = JSON.parse(postedBodies[0]!) as {
    instruction: string;
    samples: Array<{ id: string; text: string }>;
    documentMetadata?: { characters: number; lines: number; bytes: number };
  };
  expect(parsed).not.toHaveProperty('document');
  expect(parsed).not.toHaveProperty('fullDocument');
  expect(parsed).not.toHaveProperty('model');
  expect(Object.keys(parsed).sort()).toEqual(['documentMetadata', 'instruction', 'samples'].sort());
  expect(parsed.instruction.length).toBe(39);
  expect(parsed.samples.length).toBe(1);
  expect(parsed.samples[0]?.text.length).toBe(18);
  expect(parsed.documentMetadata?.characters).toBe(18);

  await page.getByTestId('run-preview').click();
  await expect(page.getByTestId('preview-after')).toHaveText('apple\nbanana');
  await expect(page.getByTestId('document-input')).toHaveValue('apple\napple\nbanana');

  await page.getByTestId('run-full').click();
  await expect(page.getByTestId('result-output')).toHaveValue('apple\nbanana');
  await expect(page.getByTestId('document-input')).toHaveValue('apple\napple\nbanana');
  await expect(page.getByTestId('copy-result')).toBeVisible();
  await expect(page.getByTestId('download-result')).toBeVisible();

  const recipePosts = await page.evaluate(
    () => (window as unknown as { __tftPostedBodies?: string[] }).__tftPostedBodies ?? [],
  );
  expect(recipePosts.length).toBe(1);
});
