import { test, expect } from '@playwright/test';

test.describe('Tags CRUD', () => {
  test('should perform full CRUD lifecycle', async ({ page }) => {
    await page.goto('/tags');

    // Create
    await page.click('[data-testid="add-tag"]');
    await page.fill('[data-testid="tag-name-input"]', 'Test Tag');
    await page.click('[data-testid="save-tag"]');
    await expect(page.locator('text=Test Tag')).toBeVisible();

    // Update
    // Clicking row opens Edit Modal
    await page.click('text=Test Tag');
    await page.fill('[data-testid="tag-name-input"]', 'Updated Tag');
    await page.click('[data-testid="save-tag"]');
    await expect(page.locator('text=Updated Tag')).toBeVisible();

    // Delete
    const row = page.locator('tr', { hasText: 'Updated Tag' });
    await row.getByTestId('delete-tag').click();
    await page.click('[data-testid="confirm-delete"]');
    await expect(page.locator('text=Updated Tag')).not.toBeVisible();
  });
});
