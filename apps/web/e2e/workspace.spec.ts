import { expect, test } from '@playwright/test';
import path from 'node:path';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';

const viewports = [
  { width: 320, height: 568 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
] as const;

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(overflow).toBe(false);
}

test('warm light shell tokens and empty preview copy', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/app');
  await expect(page.getByTestId('app-root')).toHaveAttribute('data-theme', 'warm-light');
  await expect(page.getByTestId('intelligence-empty')).toContainText(
    /your preview will appear here/i,
  );
  await expect(page.getByTestId('intelligence-empty')).toContainText(
    /describe a change to compare/i,
  );
  await expect(page.getByTestId('intelligence-empty').locator('button')).toHaveCount(0);
  await expect(page.getByTestId('example-featured').locator('button')).toHaveCount(2);
  await expect(page.getByTestId('examples-menu')).toBeHidden();
  await expect(page.getByTestId('generate-transformation')).toBeDisabled();
  await expect(page.getByTestId('generate-transformation')).toHaveClass(/button-primary/);
  await expect(page.getByTestId('rail-examples')).toBeVisible();
  await expect(page.getByTestId('advanced-editor-menu-link')).toBeHidden();
  await page.getByTestId('app-menu-toggle').click();
  await expect(page.getByTestId('advanced-editor-menu-link')).toBeVisible();
  const canvas = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim(),
  );
  expect(canvas.toLowerCase()).toBe('#f4f1eb');
});

test('example selection fills instruction without auto-generating', async ({ page }) => {
  await page.goto('/app');
  await page.getByTestId('document-input').fill('  apple  \n  apple  \n');
  await page.getByTestId('example-clean-list').click();
  await expect(page.getByTestId('instruction-input')).toHaveValue(
    'Remove duplicate lines and trim spaces',
  );
  await expect(page.getByTestId('generate-transformation')).toBeEnabled();
  await expect(page.getByTestId('generation-summary')).toHaveCount(0);
});

test('source drag overlay appears while dragging over the editor', async ({ page }) => {
  await page.goto('/app');
  const dropzone = page.getByTestId('dropzone');
  await dropzone.dispatchEvent('dragenter');
  await expect(page.getByTestId('drop-overlay')).toBeVisible();
  await expect(page.getByTestId('drop-overlay')).toContainText(/drop the file to open it locally/i);
  await dropzone.dispatchEvent('dragleave');
  await expect(page.getByTestId('drop-overlay')).toHaveCount(0);
});

test('desktop simple flow: example generate preview apply', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/app');
  await expect(page.getByTestId('app-root')).toBeVisible();
  await expect(page.getByTestId('site-footer')).toHaveCount(0);
  await page.getByTestId('document-input').fill('  apple  \n  apple  \n  banana  \n');
  await page.getByTestId('example-clean-list').click();
  await page.getByTestId('generate-transformation').click();
  await expect(page.getByTestId('generation-summary')).toBeVisible();
  await expect(page.getByTestId('advanced-details')).not.toHaveAttribute('open');
  await page.getByTestId('run-preview').click();
  await expect(page.getByTestId('preview-after')).toHaveText('apple\nbanana\n');
  await page.getByTestId('run-full').click();
  await expect(page.getByTestId('result-output')).toHaveValue('apple\nbanana\n');
  await expect(page.getByTestId('success-pill')).toBeVisible();
});

test('mobile simple flow without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/app');
  await expect(page.getByTestId('mobile-tab-preview')).toBeDisabled();
  await expect(page.getByTestId('mobile-tab-result')).toBeDisabled();
  await page.getByTestId('document-input').fill('  apple  \n  apple  \n  banana  \n');
  await page.getByTestId('example-clean-list').click();
  await page.getByTestId('generate-transformation').click();
  await expect(page.getByTestId('mobile-tab-preview')).toBeEnabled();
  await page.getByTestId('run-preview').click();
  await expect(page.getByTestId('preview-after')).toHaveText('apple\nbanana\n');
  await page.getByTestId('run-full').click();
  await expect(page.getByTestId('result-output')).toHaveValue('apple\nbanana\n');
  await expect(page.getByTestId('mobile-tab-result')).toBeEnabled();
  await expectNoHorizontalOverflow(page);
});

test('unsupported instruction stays local and friendly', async ({ page }) => {
  await page.goto('/app');
  await page.getByTestId('document-input').fill('hello\n');
  await page.getByTestId('instruction-input').fill('Make this sound like a TED talk');
  await page.getByTestId('generate-transformation').click();
  await expect(page.getByTestId('generation-error')).toContainText(/prototype currently supports/i);
  await expect(page.getByTestId('prototype-notice')).toBeVisible();
});

test('advanced editor still loads manual workspace', async ({ page }) => {
  await page.goto('/app/advanced');
  await expect(page.getByTestId('app-root')).toBeVisible();
  await expect(page.getByTestId('workspace-shell')).toBeVisible();
  await page.getByTestId('document-input').fill('  apple  \n  apple  \n  banana  \n');
  await page.getByTestId('goto-recipe').click();
  await page.getByTestId('template-clean-copied-list').click();
  await page.getByTestId('run-preview').click();
  await expect(page.getByTestId('preview-after')).toHaveText('apple\nbanana\n');
});

test('advanced editor operation order A then B differs from B then A', async ({ page }) => {
  await page.goto('/app/advanced');
  await page.getByTestId('document-input').fill('a\nb\n');
  await page.getByTestId('goto-recipe').click();
  await page.getByTestId('add-operation').selectOption('replace.literal');
  const replaceCard = page.locator('[data-testid^="operation-card-"]').first();
  const replaceId = (await replaceCard.getAttribute('data-testid'))!.replace('operation-card-', '');
  await page.getByTestId(`field-find-${replaceId}`).fill('a');
  await page.getByTestId(`field-replacement-${replaceId}`).fill('b');
  await page.getByTestId('add-operation').selectOption('lines.dedupe');
  await page.getByTestId('run-preview').click();
  await expect(page.getByTestId('preview-after')).toHaveText('b\n');
  const outputA = await page.getByTestId('preview-after').innerText();
  await page.getByTestId('stage-recipe').click();
  await page.getByTestId(`operation-down-${replaceId}`).click();
  await page.getByTestId('stage-preview').click();
  await expect(page.getByTestId('preview-after')).toHaveCount(0);
  await page.getByTestId('stage-recipe').click();
  await page.getByTestId('run-preview').click();
  await expect(page.getByTestId('preview-after')).toHaveText('b\nb\n');
  const outputB = await page.getByTestId('preview-after').innerText();
  expect(outputA).not.toEqual(outputB);
});

test('landing CTA opens the app', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('landing-cta').click();
  await expect(page).toHaveURL(/\/app/);
  await expect(page.getByTestId('simple-app-shell')).toBeVisible();
});

test('landing reduced-motion still exposes CTAs', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByTestId('landing-cta')).toBeVisible();
  await expect(page.getByTestId('landing-source')).toBeVisible();
  await expect(page.getByTestId('hero-product-window')).toBeVisible();
});

test('file input loads local text on simple app', async ({ page }) => {
  page.on('dialog', (dialog) => dialog.accept());
  const dir = mkdtempSync(path.join(tmpdir(), 'tft-'));
  const filePath = path.join(dir, 'sample.txt');
  writeFileSync(filePath, 'one\ntwo\n', 'utf8');
  await page.goto('/app');
  await page.getByTestId('file-input').setInputFiles(filePath);
  await expect(page.getByTestId('document-input')).toHaveValue('one\ntwo\n');
  await expect(page.getByTestId('file-meta')).toContainText('sample.txt');
});

for (const viewport of viewports) {
  test(`no horizontal overflow at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/app');
    await expectNoHorizontalOverflow(page);
    await page.goto('/');
    await expectNoHorizontalOverflow(page);
  });
}
