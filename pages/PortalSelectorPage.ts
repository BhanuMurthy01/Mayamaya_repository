import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class PortalSelectorPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * ✅ Start Assessment ONLY if button exists
   */
  async startAssessment() {
    await this.page.waitForLoadState('domcontentloaded');

    const currentUrl = this.page.url();
    console.log('Current URL:', currentUrl);

    const startBtn = this.page.locator(
      "button:has-text('Start Assessment')"
    );

    // ✅ Case 1: Portal selector page — button exists
    if (await startBtn.isVisible().catch(() => false)) {
      await startBtn.scrollIntoViewIfNeeded();

      await expect(startBtn).toBeVisible({ timeout: 20000 });
      await startBtn.click();

      await this.page.waitForURL(/assessment/, { timeout: 20000 });
      await this.page.waitForLoadState('networkidle');

      console.log('✅ Navigated to Assessment');
      return;
    }

    // ✅ Case 2: Already redirected to console
    if (currentUrl.includes('/console')) {
      console.log('✅ Already in console → skipping assessment click');
      return;
    }

    console.warn('⚠️ Start Assessment button not found');
  }

  /**
   * ✅ Business Console (Admin)
   */
  async accessBusinessConsole() {
    const businessButton = this.page.getByRole('button', {
      name: /Access Business Console/i,
    });

    await expect(businessButton).toBeVisible({ timeout: 20000 });

    await businessButton.click();

    await this.page.waitForURL(/console|dashboard|home|profiles/, {
      timeout: 20000,
    });

    await this.page.waitForLoadState('networkidle');

    console.log('✅ Navigated to Business Console');
  }
}