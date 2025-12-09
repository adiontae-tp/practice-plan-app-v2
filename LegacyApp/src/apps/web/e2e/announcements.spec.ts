import { test, expect } from '@playwright/test';

test.describe('Announcements CRUD', () => {
  test('should perform full CRUD lifecycle', async ({ page }) => {
    await page.goto('/announcements');

    // Create
    await page.click('[data-testid="add-announcement"]');
    await page.fill('[data-testid="announcement-title-input"]', 'Test Announcement');
    await page.fill('textarea', 'Test Message'); // Assuming textarea is the message input (no testid on it yet, relying on tag)
    await page.click('[data-testid="save-announcement"]');
    await expect(page.locator('text=Test Announcement')).toBeVisible();

    // Read (View Detail) & Update
    await page.click('text=Test Announcement');
    await expect(page.locator('[data-testid="announcement-detail"]')).toBeVisible();
    
    await page.click('[data-testid="edit-announcement"]');
    await page.fill('[data-testid="announcement-title-input"]', 'Updated Announcement');
    await page.click('[data-testid="save-announcement"]');
    await expect(page.locator('text=Updated Announcement')).toBeVisible();

    // Delete
    // Click updated item to open detail again (if not open, but update usually closes modal)
    await page.click('text=Updated Announcement');
    await page.click('[data-testid="delete-announcement"]');
    await page.click('[data-testid="confirm-delete"]');
    await expect(page.locator('text=Updated Announcement')).not.toBeVisible();
  });
});
