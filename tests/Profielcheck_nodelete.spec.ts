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

test('Profile → Delete → Contact Support → Keep Account → Logout (Professional)', async ({ page, context }) => {

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
  }

  // ✅ Go to Profile
  await page.locator('.header-light-menu-button').click();
  await page.locator('text=My Profile').click();
  await page.waitForURL(/profile/, { timeout: 15000 });

  // =========================
  // ✅ DELETE ACCOUNT CLICK
  // =========================
  const deleteBtn = page.locator('button.btn-delete-light');

  await expect(deleteBtn).toBeVisible();
  await deleteBtn.click();

  // ✅ Verify modal
  const modal = page.getByText('Delete Your Account?');
  await expect(modal).toBeVisible();

  // =========================
  // ✅ CONTACT SUPPORT (NEW TAB)
  // =========================
  const [supportPage] = await Promise.all([
    context.waitForEvent('page'),
    page.getByText('Contact Support').click(),
  ]);

  await supportPage.waitForLoadState();

  // ✅ Validate support page
  await expect(
    supportPage.getByText('Contact Our Support Team')
  ).toBeVisible();

  console.log('✅ Support page opened:', supportPage.url());

  await supportPage.close();

  // =========================
  // ✅ KEEP ACCOUNT
  // =========================
  const keepBtn = page.getByRole('button', { name: 'Keep Account' });

  await expect(keepBtn).toBeVisible();
  await keepBtn.click();

  // ✅ Modal closed
  await expect(modal).not.toBeVisible();

  // =========================
  // ✅ BACK NAVIGATION
  // =========================
  const backBtn = page.locator('button.back-btn-light');
  await backBtn.waitFor({ state: 'visible' });
  await backBtn.click({ force: true });

  // ✅ Verify redirect
  await page.waitForURL(/assessment\/home/, { timeout: 10000 });

  // =========================
  // ✅ LOGOUT
  // =========================
  await new HeaderPage(page).logout();
});