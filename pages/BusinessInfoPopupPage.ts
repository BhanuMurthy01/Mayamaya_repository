import { BasePage } from './BasePage';

export class BusinessInfoPopupPage extends BasePage {

  async fill(org: string, website: string) {
    await this.page.fill('#organization', org);
    await this.page.fill('#website', website);
    await this.page.click('.tmw-biz-btn-submit');
  }
}