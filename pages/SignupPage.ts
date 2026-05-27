import { BasePage } from './BasePage';
import { getEnvConfig } from '../config/env';

export type SignupUser = {
  name: string;
  email: string;
  password: string;
};

export class SignupPage extends BasePage {

  async open(): Promise<void> {
    await this.page.goto(getEnvConfig().signupUrl);
  }

  async signup(user: SignupUser): Promise<void> {
    await this.page.fill('#name', user.name);
    await this.page.fill('#email', user.email);
    await this.page.fill('#password', user.password);
    await this.page.locator('label.auth-checkbox').click();
    await this.page.locator('button.auth-submit').click();
  }
}