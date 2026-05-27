import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class TypeSelectionPage extends BasePage {

  /* =========================
     INDIVIDUAL USER SELECTORS
     ========================= */

  private get individualUserButton() {
    return this.page.locator('button.tmw-role-individual-btn');
    // OR fallback:
    // return this.page.locator('button:has-text("Individual")');
  }

  /**
   * Select Individual user and continue onboarding
   */
  async selectIndividual(): Promise<void> {
    // ✅ Step 1: Wait for Individual user card
    await expect(this.individualUserButton).toBeVisible({ timeout: 15000 });
    await this.individualUserButton.click();

    // ✅ Step 2: Confirm navigation to individual onboarding
    await this.page.waitForURL(/assessment|onboarding|wizard/, {
      timeout: 20000,
    });
  }

  /* =========================
     BUSINESS USER SELECTORS
     ========================= */

  private get businessUserButton() {
    return this.page.locator('button.tmw-role-business-btn');
  }

  private get businessPopup() {
    return this.page.locator('.tmw-biz-popup-container');
  }

  private get organizationInput() {
    return this.page.locator('input[name="organization"]');
  }

  private get websiteInput() {
    return this.page.locator('input[name="website"]');
  }

  private get continueAsBusinessButton() {
    return this.page.locator('button.tmw-biz-btn-submit');
  }

  /**
   * Select Business user and continue onboarding
   */
  async selectBusinessUserAndContinue(): Promise<void> {
    await expect(this.businessUserButton).toBeVisible({ timeout: 15000 });
    await this.businessUserButton.click();

    await expect(this.businessPopup).toBeVisible({ timeout: 15000 });

    await this.organizationInput.fill('Mayamaya');
    await this.websiteInput.fill('https://catenate.io');

    await expect(this.continueAsBusinessButton).toBeEnabled({ timeout: 15000 });
    await this.continueAsBusinessButton.click();

    await this.page.waitForURL(/onboarding|console|wizard/, {
      timeout: 20000,
    });
  }
}