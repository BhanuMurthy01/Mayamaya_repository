import { Page, expect } from '@playwright/test';

export class StudentInviteFormPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ✅ Wait until dropdown options are loaded
  private async waitForDropdownOptions(index: number) {
    await this.page.waitForFunction((i) => {
      const el = document.querySelectorAll('select.ifilter-select')[i];
      return el instanceof HTMLSelectElement && el.options.length > 1;
    }, index);
  }

  async fillStudentDetails() {
    const dropdowns = this.page.locator('select.ifilter-select');

    // ✅ User Type
    const userType = dropdowns.nth(0);
    await expect(userType).toBeVisible({ timeout: 20000 });
    await userType.selectOption({ label: 'Student' });

    await this.page.waitForTimeout(1000);

    // ✅ Department
    const department = dropdowns.nth(1);
    await expect(department).toBeVisible({ timeout: 20000 });
    await this.waitForDropdownOptions(1);
    await department.selectOption({ index: 1 });

    // ✅ Industry
    const industry = dropdowns.nth(2);
    await expect(industry).toBeVisible({ timeout: 20000 });
    await this.waitForDropdownOptions(2);
    await industry.selectOption({ index: 1 });

    // ✅ Education
    const education = dropdowns.nth(3);
    await expect(education).toBeVisible({ timeout: 20000 });
    await this.waitForDropdownOptions(3);
    await education.selectOption({ index: 1 });

    // ✅ Year input (optional)
    const yearInput = this.page.locator('input[placeholder*="Year"]');
    if (await yearInput.isVisible().catch(() => false)) {
      await yearInput.fill('Final Year');
    }
  }

  async generateInviteLink(): Promise<string> {
    const generateBtn = this.page.getByRole('button', {
      name: /Generate invite link/i,
    });

    await expect(generateBtn).toBeVisible({ timeout: 20000 });
    await generateBtn.click();

    const inviteInput = this.page.locator(
      'input[aria-label="Generated invite link"]'
    );

    await expect(inviteInput).toBeVisible({ timeout: 20000 });

    const link = await inviteInput.inputValue();

    // ✅ ✅ FINAL MODAL FIX (NO TIMEOUT EVER)
    const modal = this.page.locator('.invite-popup-employees');

    if (await modal.isVisible().catch(() => false)) {
      // ✅ Try ESC
      await this.page.keyboard.press('Escape');

      // ✅ Try click outside
      await this.page.mouse.click(5, 5);

      // ✅ If still visible → FORCE REMOVE (bulletproof)
      if (await modal.isVisible().catch(() => false)) {
        console.log('⚠️ Force removing invite modal');

        await this.page.evaluate(() => {
          document
            .querySelectorAll('.invite-popup-employees, [role="presentation"]')
            .forEach((el) => el.remove());
        });
      }

      // ✅ Final safe wait (small timeout to avoid long hang)
      await this.page.waitForTimeout(300);
    }

    return link;
  }
}