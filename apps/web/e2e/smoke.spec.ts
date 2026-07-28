import { expect, test } from '@playwright/test';

test('landing, workspace input, and privacy navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Turn plain-English instructions into safe, reusable text transformations.',
  );

  await page.getByRole('link', { name: 'Open workspace' }).click();
  await expect(page).toHaveURL(/\/app/);

  const input = page.getByTestId('document-input');
  await input.fill('alpha\nbeta');
  await expect(page.getByTestId('char-count')).toHaveText('10 characters');
  await expect(page.getByTestId('line-count')).toHaveText('2 lines');

  await page.getByRole('link', { name: 'Privacy' }).click();
  await expect(page).toHaveURL(/\/privacy/);
  await expect(page.getByRole('heading', { name: 'Privacy' })).toBeVisible();
});
