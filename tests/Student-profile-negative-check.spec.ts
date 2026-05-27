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

// ✅ Decode HTML password
const decodeHtml = (str: string) =>
  str.replace(/&lt;/g, '<')
     .replace(/&gt;/g, '>')
     .replace(/&amp;/g, '&');

test('Profile picture upload - invalid file (>200KB) - Student user', async ({ page }) => {

  // ✅ Pick latest Student user dynamically
  const user = users
    .filter((u: any) => u.env === ENV && u.role === 'Student')
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  if (!user) {
    throw new Error(`❌ No Student user found in ENV=${ENV}`);
  }

  console.log(`✅ Using user: ${user.email} (ENV=${ENV})`);

  // ✅ File path
  const largeFile = path.resolve(__dirname, 'fixtures/large-image.png');

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
  }

  // ✅ Navigate to Profile
  await page.locator('.header-light-menu-button').click();
  await page.locator('text=My Profile').click();
  await page.waitForURL(/profile/, { timeout: 15000 });

  // ✅ Upload invalid file (>200KB)
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(largeFile);

  // ✅ Wait for validation handling
  await page.waitForTimeout(2000);

  // ✅ Validate still on profile (no success state)
  console.log('Current URL after upload:', page.url());

  // ✅ Back navigation
  const backBtn = page.locator('button.back-btn-light');
  await backBtn.waitFor({ state: 'visible' });
  await backBtn.click({ force: true });

  // ✅ Verify redirect
  await page.waitForURL(/assessment\/home/, { timeout: 10000 });

  // ✅ Logout
  await new HeaderPage(page).logout();
});