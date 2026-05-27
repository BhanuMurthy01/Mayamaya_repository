import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HeaderPage extends BasePage {

  async logout() {
    const currentUrl = this.page.url();

    if (currentUrl.includes('/login') || currentUrl.includes('/signin')) {
      console.log('ℹ️ Already logged out');
      return;
    }

    // ✅ ✅ STEP 1: FIXED hamburger locator
    const hamburger = this.page.locator(
      'button.header-light-menu-button, button.hamburger-button'
    );

    await expect(hamburger.first()).toBeVisible({ timeout: 20000 });
    await hamburger.first().click();

    // ✅ ✅ STEP 2: Wait for dropdown
    const dropdown = this.page.locator(
      '.header-light-dropdown-container, .dropdown-menu'
    );

    await expect(dropdown.first()).toBeVisible({ timeout: 20000 });

    // ✅ ✅ STEP 3: Logout locator (correct for BOTH)
    const logoutBtn = dropdown.locator(
      'button.dropdown-item span, .header-light-dropdown-item span',
      { hasText: 'Logout' }
    );

    await expect(logoutBtn.first()).toBeVisible({ timeout: 20000 });
    await logoutBtn.first().click();

    // ✅ ✅ STEP 4: Wait for logout
    await this.page.waitForLoadState('networkidle');

    await expect(this.page).toHaveURL(/login|signin/, {
      timeout: 20000,
    });
  }
}