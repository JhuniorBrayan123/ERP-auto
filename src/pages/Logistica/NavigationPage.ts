import { type Page } from '@playwright/test';
import { esperarCargaOverlay } from '@utils/wait-helpers';

export class NavigationPage {
  constructor(private readonly page: Page) {}

  async navegarAProductosYStock(): Promise<void> {
    await this.page.getByText('Productos y servicios').click();
    await this.page
      .locator('[id="nvg_selects_cmp-header-selects_select:select-module-203-item-2007"]')
      .click();
    // Esperar que la grilla de items esté realmente cargada
    await this.page
      .getByRole('textbox', { name: 'Buscar por nombre, código o c' })
      .waitFor({ state: 'visible', timeout: 20_000 });
    // Esperar que no haya overlay cubriendo la UI
    await esperarCargaOverlay(this.page);
  }
}
