import { expect, test } from '@playwright/test';
import path from 'node:path';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';

test('manual recipe preview and full local processing', async ({ page }) => {
  await page.goto('/app');
  await page.getByTestId('document-input').fill('  apple  \n  apple  \n  banana  \n');
  await page.getByTestId('goto-recipe').click();
  await page.getByTestId('template-clean-copied-list').click();
  await page.getByTestId('run-preview').click();
  await expect(page.getByTestId('preview-after')).toHaveText('apple\nbanana\n');
  await page.getByTestId('run-full').click();
  await expect(page.getByTestId('result-output')).toHaveValue('apple\nbanana\n');
  await expect(page.getByTestId('operation-report')).toBeVisible();
  await page.getByTestId('restore-original-from-result').click();
  await page.getByTestId('stage-input').click();
  await expect(page.getByTestId('document-input')).toHaveValue(
    '  apple  \n  apple  \n  banana  \n',
  );
  await page.getByRole('link', { name: 'Privacy' }).click();
  await expect(page.getByRole('heading', { name: 'Privacy' })).toBeVisible();
  await expect(page.getByText(/stay in your browser/i)).toBeVisible();
});

test('file input loads local text', async ({ page }) => {
  const dir = mkdtempSync(path.join(tmpdir(), 'tft-'));
  const filePath = path.join(dir, 'sample.txt');
  writeFileSync(filePath, 'one\ntwo\n', 'utf8');
  await page.goto('/app');
  await page.getByTestId('file-input').setInputFiles(filePath);
  await expect(page.getByTestId('document-input')).toHaveValue('one\ntwo\n');
  await expect(page.getByTestId('file-meta')).toContainText('sample.txt');
});

test('operation order A then B differs from B then A', async ({ page }) => {
  await page.goto('/app');
  await page.getByTestId('document-input').fill('a\nb\n');
  await page.getByTestId('goto-recipe').click();

  await page.getByTestId('add-operation').selectOption('replace.literal');
  const replaceCard = page.locator('[data-testid^="operation-card-"]').first();
  const replaceId = (await replaceCard.getAttribute('data-testid'))!.replace('operation-card-', '');
  await page.getByTestId(`field-find-${replaceId}`).fill('a');
  await page.getByTestId(`field-replacement-${replaceId}`).fill('b');
  await page.getByTestId('add-operation').selectOption('lines.dedupe');

  // Order A: replace then dedupe → b\nb\n → b\n
  await page.getByTestId('run-preview').click();
  await expect(page.getByTestId('preview-after')).toHaveText('b\n');
  const outputA = await page.getByTestId('preview-after').innerText();

  await page.getByTestId('stage-recipe').click();
  // Move replace down so order becomes dedupe then replace
  await page.getByTestId(`operation-down-${replaceId}`).click();
  await page.getByTestId('stage-preview').click();
  await expect(page.getByTestId('preview-after')).toHaveCount(0);
  await expect(page.getByTestId('run-full')).toBeDisabled();

  await page.getByTestId('stage-recipe').click();
  // Order B: dedupe then replace → a\nb\n → b\nb\n
  await page.getByTestId('run-preview').click();
  await expect(page.getByTestId('preview-after')).toHaveText('b\nb\n');
  const outputB = await page.getByTestId('preview-after').innerText();
  expect(outputA).not.toEqual(outputB);
});

test('landing still opens workspace', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Open workspace' }).click();
  await expect(page).toHaveURL(/\/app/);
  await expect(page.getByTestId('workspace-shell')).toBeVisible();
});
