import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
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

test('Delete account → auto logout → relogin → verify empty organization (Student)', async ({ page, context }) => {

  const loginPage = new LoginPage(page);

  // ✅ Get latest Student user dynamically
  const user = users
    .filter((u: any) => u.env === ENV && u.role === 'Student')
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  if (!user) {
    throw new Error(`❌ No Student user found in ENV=${ENV}`);
  }

  console.log(`✅ Using user: ${user.email} (ENV=${ENV})`);

  const email = user.email;
  const password = decodeHtml(user.password);

  // ✅ Login
  await loginPage.loginWithCredentials(email, password);

  // ✅ Start assessment (if present)
  const startBtn = page.locator('.upskill-action-button.upskill-button-primary');

  if (await startBtn.count() > 0) {
    await startBtn.first().click({ force: true });
    await page.waitForURL(/assessment/, { timeout: 20000 });
  }

  // ✅ Go to Profile
  await page.locator('.header-light-menu-button').click();
  await page.locator('text=My Profile').click();
  await page.waitForURL(/profile/, { timeout: 15000 });

  // ==============================
  // ✅ OPEN DELETE MODAL
  // ==============================
  await page.locator('text=Delete Account').first().click();

  const deleteModal = page.locator('.modal-content-warning');
  await expect(deleteModal).toBeVisible();

  // ==============================
  // ✅ CONTACT SUPPORT VALIDATION
  // ==============================
  const [supportPage] = await Promise.all([
    context.waitForEvent('page'),
    deleteModal.locator('text=Contact Support').click()
  ]);

  await supportPage.waitForLoadState();
  console.log('Support URL:', supportPage.url());
  await supportPage.close();

  // ==============================
  // ✅ CONFIRM DELETE
  // ==============================
  await deleteModal.getByRole('button', { name: 'Delete Account' }).click();

  // ==============================
  // ✅ SUCCESS MODAL
  // ==============================
  const successModal = page.locator('.modal-content-success');

  await expect(successModal).toBeVisible();
  await expect(successModal).toContainText('Account Deleted');

  console.log('✅ Account deleted');

  // ==============================
  // ✅ CLICK CLOSE → REDIRECT LOGIN
  // ==============================
  await successModal.locator('.modal-close').click();

  await page.waitForURL(/login/, { timeout: 15000 });
  console.log('✅ Redirected to login page');

  // ==============================
  // ✅ RE-LOGIN
  // ==============================
  await loginPage.loginWithCredentials(email, password);

  // ✅ Start assessment again
  if (await startBtn.count() > 0) {
    await startBtn.first().click({ force: true });
    await page.waitForURL(/assessment/, { timeout: 20000 });
  }

  // ==============================
  // ✅ NAVIGATE TO ORGANIZATIONS
  // ==============================
  await page.locator('.header-light-menu-button').click();
  await page.locator('text=My Organizations').click();
  await page.waitForURL(/assessment\/organizations/);

  // ✅ ✅ Validate EMPTY organizations
  await new OrganizationPage(page).validateOrganizations('empty');

  console.log('✅ Organization is empty after re-login');

  // ✅ Logout
  await new HeaderPage(page).logout();
});