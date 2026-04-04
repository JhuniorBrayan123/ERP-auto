import { type Page } from '@playwright/test';

/**
 * Navegación global del ERP.
 * Responsable de llegar al módulo de Logística > Productos y Stock.
 */
export class NavigationPage {
  constructor(private readonly page: Page) {}

  /** Navega desde el dashboard al módulo Productos y Stock */
  async navegarAProductosYStock(): Promise<void> {
    await this.page.getByText('Productos y servicios').click();
    await this.page
      .locator('[id="nvg_selects_cmp-header-selects_select:select-module-203-item-2007"]')
      .click();
  }
}
