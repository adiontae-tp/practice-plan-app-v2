import { test } from '@playwright/test';
import { mkdirSync } from 'fs';
import { join } from 'path';

// Screenshots directory in public folder
const SCREENSHOTS_DIR = join(process.cwd(), 'public/screenshots');

/**
 * Screenshot Script for Marketing Pages
 * 
 * To use:
 * 1. Start the web app: cd src/apps/web && pnpm dev
 * 2. Log in to the app in your browser at http://localhost:3000
 * 3. Run this script: SKIP_WEBSERVER=1 pnpm playwright test take-screenshots.spec.ts --project=chromium
 * 
 * The script will navigate to each page and take screenshots.
 */

test.describe('Take Marketing Screenshots', () => {
  test.beforeAll(() => {
    // Ensure screenshots directory exists
    try {
      mkdirSync(SCREENSHOTS_DIR, { recursive: true });
      console.log(`Screenshots will be saved to: ${SCREENSHOTS_DIR}`);
    } catch (error) {
      console.error('Failed to create screenshots directory:', error);
    }
  });

  test('take screenshots for marketing pages', async ({ page, browser }) => {
    // Set viewport to a good size for screenshots
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Check if server is running
    try {
      await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 10000 });
    } catch (error) {
      throw new Error(
        'Web server is not running!\n\n' +
        'Please start the web app first:\n' +
        '  cd src/apps/web && pnpm dev\n\n' +
        'Then log in to the app in your browser at http://localhost:3000\n' +
        'After that, run this script again.'
      );
    }

    await page.waitForTimeout(3000);

    // Check if we're actually on dashboard (not redirected to login)
    const url = page.url();
    if (url.includes('/login')) {
      throw new Error(
        'Not logged in!\n\n' +
        'Please log in to the app first:\n' +
        '1. Open http://localhost:3000 in your browser\n' +
        '2. Log in to your account\n' +
        '3. Make sure you have at least one practice plan created\n' +
        '4. Then run this script again.'
      );
    }

    console.log('✓ Logged in, starting screenshots...');

    // Screenshot 1: Plan Detail Modal (from calendar)
    console.log('Taking plan detail screenshot...');
    await page.goto('/calendar', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    const planCard = page.locator('[data-testid="plan-card"]').first();
    if (await planCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await planCard.click();
      await page.waitForTimeout(2000);
      
      // Wait for modal to be fully visible
      const dialog = page.getByRole('dialog');
      if (await dialog.isVisible({ timeout: 3000 }).catch(() => false)) {
        await page.screenshot({
          path: join(SCREENSHOTS_DIR, 'plan-detail.png'),
          fullPage: false,
        });
        console.log('✓ Plan detail screenshot saved');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    } else {
      console.log('⚠ No plans found, creating a test plan...');
      // Try to create a plan
      const addButton = page.locator('[data-testid="add-plan"]');
      if (await addButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await addButton.click();
        await page.waitForTimeout(1000);
        const saveButton = page.locator('[data-testid="save-plan"]');
        if (await saveButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await saveButton.click();
          await page.waitForTimeout(2000);
          // Now try to open it
          const newPlanCard = page.locator('[data-testid="plan-card"]').first();
          if (await newPlanCard.isVisible({ timeout: 3000 }).catch(() => false)) {
            await newPlanCard.click();
            await page.waitForTimeout(2000);
            await page.screenshot({
              path: join(SCREENSHOTS_DIR, 'plan-detail.png'),
              fullPage: false,
            });
            console.log('✓ Plan detail screenshot saved');
            await page.keyboard.press('Escape');
          }
        }
      }
    }

    // Screenshot 2: Mobile view - Practice Plan
    console.log('Taking mobile practice plan screenshot...');
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 812 }, // iPhone size
      deviceScaleFactor: 2,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('/calendar', { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(3000);
    
    const mobilePlan = mobilePage.locator('[data-testid="plan-card"]').first();
    if (await mobilePlan.isVisible({ timeout: 5000 }).catch(() => false)) {
      await mobilePlan.click();
      await mobilePage.waitForTimeout(2000);
      await mobilePage.screenshot({
        path: join(SCREENSHOTS_DIR, 'mobile-practice-plan.png'),
        fullPage: false,
      });
      console.log('✓ Mobile practice plan screenshot saved');
    } else {
      // Just take calendar view
      await mobilePage.screenshot({
        path: join(SCREENSHOTS_DIR, 'mobile-practice-plan.png'),
        fullPage: false,
      });
      console.log('✓ Mobile calendar screenshot saved (no plan found)');
    }
    await mobileContext.close();

    console.log('\n✅ All screenshots taken successfully!');
    console.log(`📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);
    console.log('\nNext steps:');
    console.log('1. Review the screenshots');
    console.log('2. The marketing pages will automatically use them');
  });
});

