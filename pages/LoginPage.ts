import { BasePage } from './BasePage';
import { getEnvConfig } from '../config/env';
import { getUser } from '../config/userResolver';

export class LoginPage extends BasePage {

  /**
   * ✅ Backward compatibility for old scripts
   * Used by existing specs calling loginWithCredentials(email, password)
   */
  async loginWithCredentials(email: string, password: string) {
    // Defaulting old flows to console login
    await this.loginByContext(email, password, 'console');
  }

  /**
   * ✅ Backward compatibility for legacy console login
   */
  async loginAsConsole() {
    const user = getUser('Console');
    await this.loginByContext(user.email, user.password, 'console');
  }

  /**
   * ✅ New unified login (recommended)
   */
  async loginByContext(
    email: string,
    password: string,
    context: 'assessment' | 'console'
  ) {
    const baseUrl = getEnvConfig().baseUrl;

    const loginUrl =
      context === 'assessment'
        ? `${baseUrl}/assessment/auth/login`
        : `${baseUrl}/signin`;

    await this.page.goto(loginUrl);
    await this.page.fill('#email', email);
    await this.page.fill('#password', password);
    await this.page
      .locator('button.auth-submit, button[type="submit"]')
      .click();
  }
}