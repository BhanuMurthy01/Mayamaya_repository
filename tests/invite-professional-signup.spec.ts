import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InvitePeoplePage } from '../pages/InvitePeoplePage';
import { InviteLinkSignupPage } from '../pages/InviteLinkSignupPage';
import { PortalSelectorPage } from '../pages/PortalSelectorPage';
import { HeaderPage } from '../pages/HeaderPage';
import { createUser, Role } from './utils/userFactory';

test('Professional invite → signup → logout', async ({ browser }, testInfo) => {
  testInfo.annotations.push(
    { type: 'suite', description: 'Invite Users' },
    { type: 'feature', description: 'Professional Invite' },
    { type: 'story', description: 'Professional user joins organization' }
  );

  let inviteLink: string;

  // ----------------------------
  // ✅ ADMIN FLOW
  // ----------------------------
  await test.step('Admin logs in and generates professional invite link', async () => {
    const admin = await browser.newPage();

    await new LoginPage(admin).loginAsConsole();

    const portal = new PortalSelectorPage(admin);
    await portal.accessBusinessConsole();

    const invite = new InvitePeoplePage(admin);
    await invite.openInvite();

    await invite.selectUserType('Professional');

    // ✅ Dynamic department (NO error now)
    const department = await invite.selectDepartment();
    console.log('✅ Selected Department:', department);

    inviteLink = await invite.generateInviteLink();
    expect(inviteLink).toContain('/signup');

    await new HeaderPage(admin).logout();
    await admin.close();
  });

  // ----------------------------
  // ✅ PROFESSIONAL FLOW
  // ----------------------------
  await test.step('Professional signs up → assessment → logout', async () => {
    const professional = createUser(Role.Professional);
    const invited = await browser.newPage();

    await new InviteLinkSignupPage(invited).signupViaInvite(
      inviteLink,
      professional.name,
      professional.email,
      professional.password
    );

    const portal1 = new PortalSelectorPage(invited);
    await invited.waitForLoadState('domcontentloaded');

    if (invited.url().includes('/portal-selector')) {
      await portal1.startAssessment();
    } else {
      console.log('✅ Skipping assessment → already redirected');
    }

    await new HeaderPage(invited).logout();
    await invited.close();
  });
});