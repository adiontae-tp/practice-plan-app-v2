import { test, expect } from '@playwright/test';

test.describe('Files CRUD', () => {
  test('should perform full CRUD lifecycle', async ({ page }) => {
    await page.goto('/files');

    // Create
    await page.click('[data-testid="add-file"]');
    
    await page.setInputFiles('[data-testid="file-upload-input"]', {
        name: 'test-file.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('this is a test file')
    });
    
    await page.fill('[data-testid="file-description-input"]', 'Test Description');
    await page.click('[data-testid="save-file"]');
    await expect(page.locator('text=test-file.txt')).toBeVisible();

    // Read (View Detail)
    await page.click('text=test-file.txt');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape'); // Close modal

    // Delete
    const row = page.locator('tr', { hasText: 'test-file.txt' });
    await row.getByTestId('delete-file').click();
    await page.click('[data-testid="confirm-delete"]');
    await expect(page.locator('text=test-file.txt')).not.toBeVisible();
  });
});
