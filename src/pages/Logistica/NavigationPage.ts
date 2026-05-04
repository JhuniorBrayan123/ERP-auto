import { type Page } from '@playwright/test';

export class NavigationPage {
  constructor(private readonly page: Page) {}

  async navegarAProductosYStock(): Promise<void> {
    await this.page.getByText('Productos y servicios').click();
    await this.page
      .locator('[id="nvg_selects_cmp-header-selects_select:select-module-203-item-2007"]')
      .click();
  }
}
