import { test } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { HeaderPage } from '../pages/HeaderPage';
import { OrganizationPage } from '../pages/OrganizationPage';

dotenv.config();

// ✅ Read ENV
const ENV = process.env.ENV || 'test';

// ✅ Load users JSON
const filePath = path.resolve(__dirname, '../artifacts/created-users-test.json');
const users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// ✅ Decode HTML password (safe handling)
const decodeHtml = (str: string) =>
  str.replace(/&lt;/g, '<')
     .replace(/&gt;/g, '>')
     .replace(/&amp;/g, '&');

test('Professional user organization should not be empty', async ({ page }) => {

  // ✅ Pick latest Professional user dynamically
  const user = users
    .filter((u: any) => u.env === ENV && u.role === 'Professional')
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  if (!user) {
    throw new Error(`❌ No Professional user found in ENV=${ENV}`);
  }

  console.log(`✅ Using user: ${user.email} (ENV=${ENV})`);

  // ✅ Login
  await new LoginPage(page).loginWithCredentials(
    user.email,
    decodeHtml(user.password)
  );

  // ✅ Start Assessment
  const startBtn = page.locator('.upskill-action-button.upskill-button-primary');

  await page.waitForTimeout(3000);

  if (await startBtn.count() > 0) {
    await startBtn.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    await startBtn.first().click({ force: true });

    await page.waitForURL(/assessment/, { timeout: 20000 });
    await page.waitForLoadState('networkidle');
  }

  // ✅ Navigate to Organizations
  await page.locator('.header-light-menu-button').click();
  await page.locator('text=My Organizations').click();
  await page.waitForURL(/assessment\/organizations/);

  // ✅ Validate (PRESENT)
  await new OrganizationPage(page).validateOrganizations('present');

  // ✅ Logout
  await new HeaderPage(page).logout();
});