import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class BusinessOnboardingWizardPage extends BasePage {

  // =========================
  // Locators
  // =========================

  // ✅ Industry & Country dropdowns
  private get industryDropdown() {
    return this.page.locator('select').nth(0);
  }

  private get countryDropdown() {
    return this.page.locator('select').nth(1);
  }

  // ✅ Generate button (scoped correctly)
  private get generateButton() {
    return this.page
      .locator('form.onboarding-wizard-form')
      .locator('button.btn-primary', { hasText: 'Generate' });
  }

  // ✅ Free Courses option
  private get freeCoursesOption() {
    return this.page.locator(
      'button.upskilling-toggle-option-wizard',
      { hasText: 'Free Courses' }
    );
  }

  // ✅ ✅ FIXED: Select All (handles button / checkbox / label)
  private get selectAllButton() {
    return this.page.locator(
      "//button[contains(.,'Select')] | //label[contains(.,'Select')] | //input[@type='checkbox']"
    ).first();
  }

  // ✅ Footer button (Next / Finish)
  private get footerPrimaryButton() {
    return this.page.locator(
      'div.onboarding-wizard-footer-right button.btn-primary'
    );
  }

  // =========================
  // Steps
  // =========================

  /**
   * ✅ FIXED: Handle Industry & Country safely
   */
  async selectIndustryCountryAndGenerate() {
    // ✅ Industry
    await expect(this.industryDropdown).toBeVisible({ timeout: 20000 });

    const industryValue = await this.industryDropdown.inputValue();

    if (!industryValue) {
      await this.industryDropdown.selectOption({ index: 1 });
    } else {
      console.log('✅ Industry already selected:', industryValue);
    }

    // ✅ Country
    await expect(this.countryDropdown).toBeVisible({ timeout: 20000 });

    const countryValue = await this.countryDropdown.inputValue();

    if (!countryValue) {
      await this.countryDropdown.selectOption({ index: 1 });
    } else {
      console.log('✅ Country already selected:', countryValue);
    }

    // ✅ Generate
    await expect(this.generateButton).toBeVisible({ timeout: 20000 });
    await expect(this.generateButton).toBeEnabled({ timeout: 20000 });
    await this.generateButton.click();

    // ✅ Wait for generated content
    await expect(
      this.page.locator('textarea:not(:empty)')
    ).toBeVisible({ timeout: 30000 });
  }

  /**
   * ✅ Free courses + Next
   */
  async selectFreeCoursesAndNext() {
    await expect(this.freeCoursesOption).toBeVisible({ timeout: 20000 });
    await this.freeCoursesOption.click();

    await expect(this.footerPrimaryButton).toBeEnabled({ timeout: 20000 });
    await this.footerPrimaryButton.click();
  }

  /**
   * ✅ FIXED: Select all Departments
   */
  async selectAllDepartmentsAndNext() {
    await expect(this.selectAllButton).toBeVisible({ timeout: 20000 });

    try {
      await this.selectAllButton.check(); // ✅ checkbox case
    } catch {
      await this.selectAllButton.click(); // ✅ button/label case
    }

    await expect(this.footerPrimaryButton).toBeEnabled({ timeout: 20000 });
    await this.footerPrimaryButton.click();
  }

  /**
   * ✅ FIXED: Select all Roles
   */
  async selectAllRolesAndFinish() {
    await expect(this.selectAllButton).toBeVisible({ timeout: 20000 });

    try {
      await this.selectAllButton.check();
    } catch {
      await this.selectAllButton.click();
    }

    await expect(this.footerPrimaryButton).toBeVisible({ timeout: 20000 });
    await expect(this.footerPrimaryButton).toBeEnabled({ timeout: 20000 });
    await this.footerPrimaryButton.click();
  }

  // =========================
  // Full Flow
  // =========================

  async completeBusinessOnboarding() {
    await this.selectIndustryCountryAndGenerate();
    await this.selectFreeCoursesAndNext();
    await this.selectAllDepartmentsAndNext();
    await this.selectAllRolesAndFinish();
  }
}