import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('accessibility smoke', () => {
  for (const route of ['/', '/app'] as const) {
    test(`axe critical issues on ${route}`, async ({ page }) => {
      await page.goto(route);
      if (route === '/app') {
        await page.getByTestId('document-input').fill('alpha\nbeta\n');
        await page.getByTestId('goto-recipe').click();
        await page.getByTestId('template-clean-copied-list').click();
      }
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      const serious = results.violations.filter(
        (item) => item.impact === 'critical' || item.impact === 'serious',
      );
      expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
    });
  }
});
