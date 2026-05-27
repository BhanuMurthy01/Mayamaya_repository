import { Page, Locator } from '@playwright/test';

export class TutorialPage {
  page: Page;
  skipBtn: Locator;
  nextBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.skipBtn = page.locator('button.tutorial-skip-btn-unique');
    this.nextBtn = page.locator('button.tutorial-next-btn-unique');
  }

  async handleTutorial() {
    if (await this.skipBtn.isVisible().catch(() => false)) {
      await this.skipBtn.click();
      return;
    }

    for (let i = 0; i < 5; i++) {
      if (await this.nextBtn.isVisible().catch(() => false)) {
        await this.nextBtn.click();
        await this.page.waitForTimeout(300);
      } else {
        break;
      }
    }
  }
}