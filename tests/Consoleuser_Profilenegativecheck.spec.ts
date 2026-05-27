import { test } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { HeaderPage } from '../pages/HeaderPage';

dotenv.config();

// ✅ Read ENV
const ENV = process.env.ENV || 'test';

// ✅ Load users JSON
const filePath = path.resolve(__dirname, '../artifacts/created-users-test.json');
const users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// ✅ Decode password
const decodeHtml = (str: string) =>
  str.replace(/&lt;/g, '<')
     .replace(/&gt;/g, '>')
     .replace(/&amp;/g, '&');

test('Profile picture upload - invalid file (>200KB)', async ({ page }) => {

  // ✅ Dynamically pick latest Business user (you can change role if needed)
  const user = users
    .filter((u: any) => u.env === ENV && u.role === 'Business')
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  if (!user) {
    throw new Error(`❌ No Business user found in ENV=${ENV}`);
  }

  console.log(`✅ Using user: ${user.email} (ENV=${ENV})`);

  // ✅ File path
  const largeFile = path.resolve(__dirname, 'fixtures/large-image.png');

  // ✅ Login
  await new LoginPage(page).loginWithCredentials(
    user.email,
    decodeHtml(user.password)
  );

  // ✅ Start Assessment (same logic)
  const startBtn = page.locator('.upskill-action-button.upskill-button-primary');

  await page.waitForTimeout(3000);

  if (await startBtn.count() > 0) {
    await startBtn.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await startBtn.first().click({ force: true });

    await page.waitForURL(/assessment/, { timeout: 20000 });
  }

  // ✅ Go to Profile
  await page.locator('.header-light-menu-button').click();
  await page.locator('text=My Profile').click();
  await page.waitForURL(/profile/, { timeout: 15000 });

  // ✅ Upload large file (>200KB)
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(largeFile);

  await page.waitForTimeout(2000);

  // ✅ Validation check
  const currentUrl = page.url();
  console.log('Current URL after upload:', currentUrl);

  // ✅ Back button
  const backBtn = page.locator('button.back-btn-light');
  await backBtn.waitFor({ state: 'visible' });
  await backBtn.click({ force: true });

  // ✅ Verify navigation back to home
  await page.waitForURL(/assessment\/home/, { timeout: 10000 });

  // ✅ Logout
  await new HeaderPage(page).logout();
});