import { test, expect } from '@playwright/test';

test.describe('Periods CRUD', () => {
  test('should perform full CRUD lifecycle', async ({ page }) => {
    await page.goto('/periods');

    // Create
    await page.click('[data-testid="add-period"]');
    await page.fill('[data-testid="period-name-input"]', 'Test Period');
    await page.waitForTimeout(500);
    await page.click('[data-testid="save-period"]');
    await expect(page.locator('text=Test Period')).toBeVisible();

    // Update
    await page.click('text=Test Period');
    await page.fill('[data-testid="period-name-input"]', 'Updated Period');
    await page.click('[data-testid="save-period"]');
    await expect(page.locator('text=Updated Period')).toBeVisible();

    // Delete
    const row = page.locator('tr', { hasText: 'Updated Period' });
    await row.getByTestId('delete-period').click();
    await page.click('[data-testid="confirm-delete"]');
    await expect(page.locator('text=Updated Period')).not.toBeVisible();
  });
});
