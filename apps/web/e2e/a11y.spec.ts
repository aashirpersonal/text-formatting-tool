import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function expectNoSeriousViolations(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  const serious = results.violations.filter(
    (item) => item.impact === 'critical' || item.impact === 'serious',
  );
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
}

test.describe('accessibility smoke', () => {
  test('axe critical issues on landing', async ({ page }) => {
    await page.goto('/');
    await expectNoSeriousViolations(page);
  });

  test('axe critical issues on initial app', async ({ page }) => {
    await page.goto('/app');
    await expectNoSeriousViolations(page);
  });

  test('axe critical issues on generated preview', async ({ page }) => {
    await page.goto('/app');
    await page.getByTestId('document-input').fill('  apple  \n  apple  \n');
    await page.getByTestId('example-clean-list').click();
    await page.getByTestId('generate-transformation').click();
    await page.getByTestId('run-preview').click();
    await expect(page.getByTestId('preview-after')).toBeVisible();
    await expectNoSeriousViolations(page);
  });

  test('axe critical issues on result', async ({ page }) => {
    await page.goto('/app');
    await page.getByTestId('document-input').fill('  apple  \n  apple  \n');
    await page.getByTestId('example-clean-list').click();
    await page.getByTestId('generate-transformation').click();
    await page.getByTestId('run-preview').click();
    await page.getByTestId('run-full').click();
    await expect(page.getByTestId('result-output')).toBeVisible();
    await expectNoSeriousViolations(page);
  });

  test('axe critical issues on mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/app');
    await page.getByTestId('nav-toggle').click();
    await expect(page.getByTestId('nav-toggle')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.nav-panel.is-open')).toBeVisible();
    await expectNoSeriousViolations(page);
  });
});
