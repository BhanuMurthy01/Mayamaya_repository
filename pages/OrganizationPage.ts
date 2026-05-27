import { BasePage } from './BasePage';
import { expect, Page } from '@playwright/test';

export class OrganizationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private get organizationCards() {
    return this.page.locator('.org-card');
  }

  private get organizationTitles() {
    return this.page.locator('.org-card-title');
  }

  /**
   * ✅ FINAL UNIVERSAL METHOD
   */
  async validateOrganizations(expected: 'present' | 'empty') {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);

    const count = await this.organizationCards.count();
    console.log('✅ Organization count:', count);

    if (expected === 'present') {
      await expect(this.organizationCards.first()).toBeVisible({
        timeout: 20000,
      });

      const names = await this.organizationTitles.allTextContents();
      console.log('✅ Organizations:', names);

    } else {
      // ✅ ONLY validate count — nothing else
      await expect(this.organizationCards).toHaveCount(0);

      console.log('✅ No organizations found for this user');
    }
  }
}