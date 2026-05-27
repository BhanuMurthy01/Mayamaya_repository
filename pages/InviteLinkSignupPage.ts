import { BasePage } from './BasePage';
import { Page } from '@playwright/test';

export class InviteLinkSignupPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async signupViaInvite(
    inviteLink: string,
    name: string,
    email: string,
    password: string
  ) {
    // ✅ STEP 1: Open invite link
    await this.page.goto(inviteLink);

    // ✅ STEP 2: Fill signup form
    await this.page.fill('#name', name);
    await this.page.fill('#email', email);
    await this.page.fill('#password', password);

    // ✅ Confirm password (if present)
    const confirmPassword = this.page.locator('#confirmPassword');
    if (await confirmPassword.isVisible().catch(() => false)) {
      await confirmPassword.fill(password);
    }

    // ✅ Accept terms
    await this.page.locator('label.auth-checkbox').click();

    // ✅ STEP 3: Submit signup
    await this.page.locator('button.auth-submit').click();

    // ✅ ✅ STEP 4: WAIT for post-signup navigation (FIXED)
    await Promise.race([
      this.page.waitForURL(/console/, { timeout: 20000 }),
      this.page.waitForURL(/portal-selector/, { timeout: 20000 }),
      this.page.waitForURL(/assessment/, { timeout: 20000 }),
    ]);

    await this.page.waitForLoadState('networkidle');

    console.log('✅ Landed after signup:', this.page.url());
  }
}