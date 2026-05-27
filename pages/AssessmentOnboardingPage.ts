import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export class AssessmentOnboardingPage extends BasePage {

  /**
   * ✅ Handles quiz intro modal (Skip / Next)
   * Blocks header until dismissed
   */
  async handleQuizIntroModal() {
    const quizTitle = this.page.locator('text=Quiz');

    const visible = await quizTitle.isVisible().catch(() => false);
    if (!visible) {
      // ✅ Modal not present (user already handled it earlier)
      return;
    }

    // Prefer Skip to avoid quiz flow
    const skipButton = this.page.locator('button:has-text("Skip")');
    if (await skipButton.isVisible().catch(() => false)) {
      await skipButton.click();
      return;
    }

    // Fallback: click Next
    const nextButton = this.page.locator('button:has-text("Next")');
    if (await nextButton.isVisible().catch(() => false)) {
      await nextButton.click();
    }
  }

  /**
   * ✅ Hard-click tutorial bubbles (Next → Next → Finish)
   */
  async completeFirstTimeTutorial() {
    await this.page.waitForSelector('.tutorial-bubble-unique', {
      timeout: 10000,
    }).catch(() => null);

    for (let i = 0; i < 5; i++) {
      const clicked = await this.page.evaluate(() => {
        const btn = document.querySelector(
          'button.tutorial-next-btn-unique'
        ) as HTMLButtonElement | null;

        if (btn && !btn.disabled) {
          btn.click();
          return true;
        }
        return false;
      });

      if (!clicked) break;

      await new Promise(res => setTimeout(res, 400));
    }
  }

  /**
   * ✅ Handles "Welcome to Mayamaya" → Continue
   */
  async continueWelcomeFlow() {
    const continued = await this.page.evaluate(() => {
      const btn = document.querySelector(
        'button.start-btn'
      ) as HTMLButtonElement | null;

      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (continued) {
      await expect(this.page).toHaveURL(/assessment\/home/, {
        timeout: 10000,
      });
    }
  }
}