import { test } from '@playwright/test';
import { SignupPage } from '../pages/SignupPage';
import { TypeSelectionPage } from '../pages/TypeSelectionPage';
import { HeaderPage } from '../pages/HeaderPage';
import { createUser, Role } from './utils/userFactory';

test(
  'Create Individual user and logout',
  async ({ page }, testInfo) => {

    testInfo.annotations.push(
      { type: 'suite', description: 'Individual User' },
      { type: 'feature', description: 'User Creation' },
      {
        type: 'story',
        description: 'Create individual user and logout without entering assessment',
      }
    );

    const user = createUser(Role.Individual);

    await test.step('Signup individual user', async () => {
      const signupPage = new SignupPage(page);

      await signupPage.open();          // ✅ fixed
      await signupPage.signup(user);    // ✅ fixed

      await new TypeSelectionPage(page).selectIndividual();
    });

    await test.step('Logout immediately after signup', async () => {
       await new HeaderPage(page).logout();
       await page.close();
    });

    testInfo.annotations.push({
      type: 'note',
      description: `User created successfully: ${user.email}`,
    });
  }
);