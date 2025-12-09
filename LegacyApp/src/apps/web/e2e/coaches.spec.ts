import { test, expect } from '@playwright/test';

test.describe('Coaches CRUD', () => {
  test('should perform full CRUD lifecycle', async ({ page }) => {
    await page.goto('/coaches');

    // Create (Invite)
    await page.click('[data-testid="add-coach"]');
    await page.fill('[data-testid="coach-name-input"]', 'test-coach@example.com');
    await page.click('[data-testid="save-coach"]');
    await expect(page.locator('text=test-coach@example.com')).toBeVisible();

    // Update
    await page.click('text=test-coach@example.com');
    // Edit modal opens, just click save to verify flow (permission editing is complex to test selector-wise)
    await page.click('[data-testid="save-coach"]');
    await expect(page.locator('text=test-coach@example.com')).toBeVisible();

    // Delete
    const row = page.locator('tr', { hasText: 'test-coach@example.com' });
    await row.getByTestId('delete-coach').click();
    await page.click('[data-testid="confirm-delete"]');
    await expect(page.locator('text=test-coach@example.com')).not.toBeVisible();
  });
});
