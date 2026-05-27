import { test, expect } from '@playwright/test';
import { SignupPage } from '../pages/SignupPage';
import { TypeSelectionPage } from '../pages/TypeSelectionPage';
import { BusinessOnboardingWizardPage } from '../pages/BusinessOnboardingWizardPage';
import { HeaderPage } from '../pages/HeaderPage';
import { createUser, Role } from './utils/userFactory';

test.describe('Business User Full Onboarding', () => {

  test('should complete business user onboarding successfully', async ({ page }) => {
    // ----------------------------
    // Test Data
    // ----------------------------
    const user = createUser(Role.Business);

    // ----------------------------
    // Page Objects
    // ----------------------------
    const signupPage = new SignupPage(page);
    const typeSelectionPage = new TypeSelectionPage(page);
    const onboardingWizard = new BusinessOnboardingWizardPage(page);
    const headerPage = new HeaderPage(page);

    // ----------------------------
    // Flow
    // ----------------------------
    await signupPage.open();
    await signupPage.signup(user);

    // Select Business user and submit business info popup
    await typeSelectionPage.selectBusinessUserAndContinue();

    // Complete onboarding wizard:
    // - Generate
    // - Select Free Courses
    // - Next
    // - Select Departments
    // - Next
    // - Select Roles
    // - Finish
    await onboardingWizard.completeBusinessOnboarding();

    // ----------------------------
    // Assertion
    // ----------------------------
    //await expect(await headerPage.isUserLoggedIn()).toBeTruthy();

    // ----------------------------
    // Logout
    // ----------------------------
    await headerPage.logout();
  });

});