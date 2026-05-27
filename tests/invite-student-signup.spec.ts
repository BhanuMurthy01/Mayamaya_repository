import { test, expect, Page, Locator } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InvitePeoplePage } from '../pages/InvitePeoplePage';
import { StudentInviteFormPage } from '../pages/StudentInviteFormPage';
import { HeaderPage } from '../pages/HeaderPage';
import { PortalSelectorPage } from '../pages/PortalSelectorPage';
import { createUser, Role } from './utils/userFactory';

//
// ✅ CLOSE CHAT POPUP (X BUTTON)
//
async function closeChatPopup(page: Page) {
  try {
    const btn = page.locator('button[aria-label="Close live chat"]').first();
    if (await btn.isVisible({ timeout: 1000 })) {
      await btn.click({ force: true });
      console.log('✅ Chat popup closed');
      return;
    }
  } catch {}

  for (const frame of page.frames()) {
    try {
      const btn = frame.locator('button[aria-label="Close live chat"]').first();
      if (await btn.isVisible({ timeout: 500 })) {
        await btn.click({ force: true });
        console.log('✅ Chat popup closed (iframe)');
        return;
      }
    } catch {}
  }
}

//
// ✅ SAFE TYPE (with blur)
//
async function safeType(locator: Locator, value: string, page: Page) {
  await closeChatPopup(page);

  await locator.waitFor({ state: 'visible' });
  await locator.click();

  await locator.fill('');
  await locator.type(value, { delay: 50 });

  await locator.press('Tab'); // ✅ triggers validation
}

test('Student invite → signup → logout', async ({ browser }) => {
  let inviteLink: string;

  // ================= ADMIN =================
  const admin = await browser.newPage();

  await new LoginPage(admin).loginAsConsole();
  await new PortalSelectorPage(admin).accessBusinessConsole();

  const invitePage = new InvitePeoplePage(admin);
  await invitePage.openInvite();

  const form = new StudentInviteFormPage(admin);
  await form.fillStudentDetails();

  inviteLink = await form.generateInviteLink();
  expect(inviteLink).toContain('/signup');

  await new HeaderPage(admin).logout();
  await admin.close();

  // ================= STUDENT =================
  const student = createUser(Role.Student);

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(inviteLink);

  await closeChatPopup(page);

  //
  // ✅ FILL FORM
  //
  await safeType(page.getByPlaceholder(/full name/i), student.name, page);
  await safeType(page.getByPlaceholder(/email/i), student.email, page);
  await safeType(page.getByPlaceholder(/password/i), student.password, page);

  //
  // ✅ ✅ CHECK TERMS & CONDITIONS (CRITICAL FIX)
  //
  const termsCheckbox = page.locator('input[type="checkbox"][required]');
  await termsCheckbox.check({ force: true });

  // ✅ trigger validation again
  await page.click('body');

  await closeChatPopup(page);

  //
  // ✅ SUBMIT
  //
  const signupBtn = page.locator('button.auth-submit');

  await expect(signupBtn).toBeEnabled({ timeout: 15000 });

  await signupBtn.click();

  //
  // ✅ WAIT FOR REDIRECT
  //
  await page.waitForURL(/portal-selector|assessment|console|dashboard/, {
    timeout: 30000,
  });

  console.log('✅ Student landed at:', page.url());

  //
  // ✅ CLOSE POPUP AGAIN
  //
  await closeChatPopup(page);

  //
  // ✅ HANDLE LANDING
  //
  if (page.url().includes('/portal-selector')) {
    const portal = new PortalSelectorPage(page);
    await closeChatPopup(page);
    await portal.startAssessment();
  } 
  else if (page.url().includes('/assessment')) {

    await closeChatPopup(page);

    const switchBtn = page.getByRole('button', {
      name: /business console/i,
    });

    if (await switchBtn.isVisible().catch(() => false)) {
      await switchBtn.click();

      await page.waitForURL(/console|dashboard|home/, {
        timeout: 20000,
      });

      console.log('✅ Switched to Console');
    }
  }

  await page.waitForLoadState('networkidle');

  //
  // ✅ FINAL CLEANUP
  //
  await closeChatPopup(page);

  await new HeaderPage(page).logout();

  await page.close();
  await context.close();
});