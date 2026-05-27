import { BasePage } from './BasePage';
import { Page, expect } from '@playwright/test';
import { PortalSelectorPage } from './PortalSelectorPage';

export class InvitePeoplePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async openInvite() {
    if (
      this.page.url().includes('/portal-selector') ||
      this.page.url().includes('/signin')
    ) {
      const portal = new PortalSelectorPage(this.page);
      await portal.accessBusinessConsole();

      await this.page.waitForURL(/console|dashboard|home|profiles/, {
        timeout: 20000,
      });
    }

    await this.page.waitForLoadState('networkidle');

    const peopleMenu = this.page.locator("//*[contains(text(),'People')]").first();
    await expect(peopleMenu).toBeVisible();
    await peopleMenu.click();

    const profilesMenu = this.page.locator('text=Profiles').first();
    await expect(profilesMenu).toBeVisible();
    await profilesMenu.click();

    const inviteBtn = this.page.getByRole('button', {
      name: /Invite People/i,
    });

    await expect(inviteBtn).toBeVisible();
    await inviteBtn.click();
  }

  async selectUserType(type: 'Student' | 'Professional') {
    const dropdown = this.page.locator('select.ifilter-select').nth(0);
    await expect(dropdown).toBeVisible();
    await dropdown.selectOption({ label: type });
  }

  /**
   * ✅ FINAL FIX - Optional param + dynamic selection
   */
  async selectDepartment(name?: string): Promise<string> {
    const dropdown = this.page.locator('select.ifilter-select').nth(1);

    await expect(dropdown).toBeVisible();

    // ✅ wait for options load
    await this.page.waitForFunction(() => {
      const selects = document.querySelectorAll('select.ifilter-select');
      return (
        selects[1] &&
        selects[1] instanceof HTMLSelectElement &&
        selects[1].options.length > 1
      );
    });

    const options = await dropdown.locator('option').allTextContents();

    const validOptions = options.filter(
      opt => opt.trim() !== '' && !opt.toLowerCase().includes('select')
    );

    let selected: string;

    if (name) {
      if (!validOptions.some(opt => opt.includes(name))) {
        throw new Error(
          `❌ Department "${name}" not found. Available: ${validOptions.join(', ')}`
        );
      }
      selected = name;
    } else {
      selected =
        validOptions[Math.floor(Math.random() * validOptions.length)];
    }

    console.log('✅ Selected Department:', selected);

    await dropdown.selectOption({ label: selected });

    return selected;
  }

  async generateInviteLink(): Promise<string> {
    const generateBtn = this.page.getByRole('button', {
      name: /Generate invite link/i,
    });

    await expect(generateBtn).toBeVisible();
    await generateBtn.click();

    const inviteInput = this.page.locator(
      'input[aria-label="Generated invite link"]'
    );

    await expect(inviteInput).toBeVisible();

    const link = await inviteInput.inputValue();

    const closeBtn = this.page.getByRole('button', { name: /close/i });

    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click();
    } else {
      await this.page.keyboard.press('Escape');
    }

    return link;
  }
}