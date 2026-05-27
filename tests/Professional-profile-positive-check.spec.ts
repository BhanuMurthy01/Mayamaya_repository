import { test, expect } from '@playwright/test';
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

test('Profile picture upload - valid file (<200KB) - Professional user', async ({ page }) => {

  // ✅ Pick latest Professional user dynamically
  const user = users
    .filter((u: any) => u.env === ENV && u.role === 'Professional')
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  if (!user) {
    throw new Error(`❌ No Professional user found in ENV=${ENV}`);
  }

  console.log(`✅ Using user: ${user.email} (ENV=${ENV})`);

  // ✅ File path
  const smallFile = path.resolve(__dirname, 'fixtures/small-image.png');

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

  // ✅ Upload valid file (<200KB)
  const fileInput = page.locator('input[type="file"]');
  await fileInput.waitFor({ state: 'attached' });
  await fileInput.setInputFiles(smallFile);

  await page.waitForTimeout(2000);

  // ✅ Validate image displayed
  await expect(page.locator('.profile-picture-light img')).toBeVisible();

  // ✅ Save
  const saveBtn = page.locator('.btn-save-light');
  await saveBtn.waitFor({ state: 'visible' });
  await saveBtn.click();

  await page.waitForTimeout(2000);

  // ✅ Back navigation
  const backBtn = page.locator('button.back-btn-light');
  await backBtn.waitFor({ state: 'visible' });
  await backBtn.click({ force: true });

  // ✅ Verify redirect to home
  await page.waitForURL(/assessment\/home/, { timeout: 15000 });

  // ✅ Logout
  await new HeaderPage(page).logout();
});