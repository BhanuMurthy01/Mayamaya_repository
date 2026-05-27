import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { HeaderPage } from '../pages/HeaderPage';
import { PortalSelectorPage } from '../pages/PortalSelectorPage';

const USER = {
  email: 'student-1778767819313@yopmail.com',
  password: 'F2LZh9#-',
};

//
// ✅ Tutorial handler
//
async function handleTutorial(page: Page) {
  const skipBtn = page.locator('button.tutorial-skip-btn-unique');
  const nextBtn = page.locator('button.tutorial-next-btn-unique');

  if (await skipBtn.isVisible().catch(() => false)) {
    await skipBtn.click();
    return;
  }

  for (let i = 0; i < 5; i++) {
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(300);
    } else break;
  }
}

//
// ✅ FINAL ANSWER LOGIC
//
async function answerQuestion(page: Page) {

  // ✅ RADIO
  const radio = page.locator('input[type="radio"]');
  if (await radio.count() > 0) {
    await radio.first().click();
    return;
  }

  // ✅ ✅ RANKING (CLICK 4 + SCROLL DOWN)
  const rankingButtons = page.locator('button.newarrange-option-button');

  const count = await rankingButtons.count();

  if (count >= 4) {
    console.log(`✅ Ranking question → clicking ${count} options`);

    for (let i = 0; i < count; i++) {
      await rankingButtons.nth(i).scrollIntoViewIfNeeded();
      await rankingButtons.nth(i).click();
      await page.waitForTimeout(300);
    }

    // ✅ ✅ CRITICAL STEP: SCROLL DOWN TO DONE BUTTON
    await page.mouse.wheel(0, 800);

    return;
  }

  // ✅ CARD
  const cards = page.locator('.cursor-pointer, [role="radio"], .answer-option');
  if (await cards.count() > 0) {
    await cards.first().click();
    return;
  }

  throw new Error('❌ Unknown question type');
}

//
// ✅ MAIN TEST
//
test('✅ FINAL MayaMaya Flow (Fixed Done Click)', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const portalPage = new PortalSelectorPage(page);
  const headerPage = new HeaderPage(page);

  // ✅ 1. LOGIN
  await loginPage.loginWithCredentials(USER.email, USER.password);

  // ✅ 2. PORTAL SELECTOR
  await portalPage.startAssessment();

  // ✅ 3. WAIT FOR HOME
  await page.waitForURL(/assessment\/home/, { timeout: 20000 });

  await handleTutorial(page);

  // ✅ 4. CLICK QUIZ
  const quizBtn = page.getByRole('button', { name: 'TAKE THE QUIZ' });

  await expect(quizBtn).toBeVisible({ timeout: 15000 });
  await quizBtn.click();

  await page.locator('text=Question').first().waitFor({ timeout: 15000 });

  await handleTutorial(page);

  // ✅ 5. ANSWER QUESTIONS
  for (let i = 0; i < 27; i++) {
    console.log(`▶ Question ${i + 1}`);

    await page.locator('text=Question').first().waitFor();

    await answerQuestion(page);

    // ✅ small UI delay
    await page.waitForTimeout(500);

    const doneBtn = page.locator('button.newquiz-done-button');

    await doneBtn.waitFor({ state: 'visible', timeout: 15000 });

    await expect(doneBtn).toHaveClass(/enabled/, { timeout: 15000 });

    // ✅ Scroll into view (extra safety)
    await doneBtn.scrollIntoViewIfNeeded();

    try {
      await doneBtn.click({ timeout: 5000 });
    } catch {
      console.log('⚠️ fallback force click');
      await doneBtn.click({ force: true });
    }

    // ✅ Required wait
    await page.waitForTimeout(2000);
  }

  // ✅ 6. VERIFY RESULTS
  await expect(
    page.locator('text=Skills, text=Reports')
  ).toBeVisible({ timeout: 20000 });

  // ✅ 7. LOGOUT
  await headerPage.logout();
});