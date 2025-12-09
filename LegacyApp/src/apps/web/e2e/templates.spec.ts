import { test, expect } from '@playwright/test';

test.describe('Templates CRUD', () => {
  test('should perform full CRUD lifecycle', async ({ page }) => {
    await page.goto('/templates');

    // Create
    await page.click('[data-testid="add-template"]');
    await page.fill('[data-testid="template-name-input"]', 'Test Template');
    await page.click('[data-testid="save-template"]');
    await expect(page.locator('text=Test Template')).toBeVisible();

    // Read / Update
    await page.click('text=Test Template');
    await expect(page.locator('[data-testid="template-detail"]')).toBeVisible();
    
    await page.click('[data-testid="edit-template"]');
    await page.fill('[data-testid="template-name-input"]', 'Updated Template');
    await page.click('[data-testid="save-template"]');
    await expect(page.locator('text=Updated Template')).toBeVisible();

    // Delete
    // Click updated item to open detail again
    await page.click('text=Updated Template');
    await page.click('[data-testid="delete-template"]');
    await page.click('[data-testid="confirm-delete"]');
    await expect(page.locator('text=Updated Template')).not.toBeVisible();
  });
});
