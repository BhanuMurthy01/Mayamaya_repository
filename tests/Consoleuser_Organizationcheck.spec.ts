import { test, Page } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { HeaderPage } from '../pages/HeaderPage';
import { OrganizationPage } from '../pages/OrganizationPage';

dotenv.config();

const ENV = process.env.ENV || 'test';

const filePath = path.resolve(__dirname, '../artifacts/created-users-test.json');
const users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// ✅ Decode password
const decodeHtml = (str: string) =>
  str.replace(/&amp;lt;/g, '<')
     .replace(/&amp;gt;/g, '>')
     .replace(/&amp;amp;/g, '&');


// ✅ ✅ ✅ FINAL POPUP HANDLER (XPATH - BULLETPROOF)
async function closeChatPopup(page: Page) {
  try {
    // ✅ BEST XPATH (button itself, NOT svg/path)
    const closeBtn = page.locator('//button[@data-test-id="header-close-button"]');

    // ✅ Wait for popup (because it loads async)
    await closeBtn.waitFor({ state: 'visible', timeout: 7000 }).catch(() => {});

    if (await closeBtn.isVisible()) {
      console.log('✅ Chat popup detected (XPath)');

      await closeBtn.click({ force: true });

      // ✅ Wait until closed
      await closeBtn.waitFor({ state: 'hidden', timeout: 5000 });
    }
  } catch {
    console.log('⚠️ Chat popup not present');
  }
}


test('Business console user organization should not be empty', async ({ page }) => {

  // ✅ Pick latest Business user
  const user = users
    .filter((u: any) => u.env === ENV && u.role === 'Business')
    .sort((a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

  if (!user) {
    throw new Error(`❌ No Business user found in ENV=${ENV}`);
  }

  console.log(`✅ Using user: ${user.email} (ENV=${ENV})`);

  // ✅ LOGIN
  await new LoginPage(page).loginWithCredentials(
    user.email,
    decodeHtml(user.password)
  );

  await closeChatPopup(page);


  // ✅ START ASSESSMENT
  const startBtn = page.locator('.upskill-action-button.upskill-button-primary');

  if (await startBtn.count() > 0) {
    await startBtn.first().click({ force: true }).catch(async () => {
      await closeChatPopup(page);
      await startBtn.first().click({ force: true });
    });

    await page.waitForURL(/assessment/, { timeout: 20000 });
    await page.waitForLoadState('networkidle');

    // ✅ popup reappears here
    await closeChatPopup(page);
  }


  // ✅ NAVIGATION (SAFE)
  await closeChatPopup(page);

  await page.locator('.header-light-menu-button').click().catch(async () => {
    await closeChatPopup(page);
    await page.locator('.header-light-menu-button').click();
  });

  await closeChatPopup(page);

  await page.locator('text=My Organizations').click();
  await page.waitForURL(/assessment\/organizations/);

  await closeChatPopup(page);


  // ✅ VALIDATION
  await new OrganizationPage(page).validateOrganizations('present');


  // ✅ LOGOUT
  await new HeaderPage(page).logout();
});