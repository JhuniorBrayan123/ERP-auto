import { type Page, type Locator } from '@playwright/test';

export class ListaItemsPage {
  constructor(private readonly page: Page) {}

  private get searchInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Buscar por nombre, código o c' });
  }

  private get actionsToggle(): Locator {
    return this.page
      .locator(
        '.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle',
      )
      .first();
  }

  async searchByCode(code: string): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.fill(code);

    await this.page
      .locator('[id="lgt_items_cmp-filtro-items:filtro:filtro_section_v-input:button_search"]')
      .click();

    await this.page
      .locator('[id="cmn_cmp-overload:loading"]')
      .waitFor({ state: 'visible', timeout: 5_000 })
      .catch(() => {}); // Puede no aparecer si la carga fue instantánea

    await this.page
      .locator('[id="cmn_cmp-overload:loading"]')
      .waitFor({ state: 'hidden', timeout: 15_000 })
      .catch(() => {});

    await this.page.waitForLoadState('networkidle');
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.clear();
  }

  async openActionsMenu(): Promise<void> {
    await this.actionsToggle.click();
  }

  async clickEditItem(): Promise<void> {
    await this.page
      .locator(
        '[id="lgt_items_cmp-grid-options:opciones_items_cmp-dropdown:options-li:edicion-item"]',
      )
      .click();
  }

  async clickCloneItem(): Promise<void> {
    await this.page
      .locator(
        '[id="lgt_items_cmp-grid-item-option:opciones_items_cmp-dropdown:options-li:clonar-item"]',
      )
      .click();
  }

  async searchAndEdit(code: string): Promise<void> {
    await this.searchByCode(code);
    await this.openActionsMenu();
    await this.clickEditItem();
  }

  async searchAndClone(code: string): Promise<void> {
    await this.searchByCode(code);
    await this.openActionsMenu();
    await this.clickCloneItem();
  }

  async openFirstMovementActions(): Promise<void> {
    await this.actionsToggle.click();
  }

  async clickVerItemFromMovements(): Promise<void> {
    const option = this.page.getByText(/^Ver item$/i).first();
    if (await option.isVisible().catch(() => false)) {
      await option.click();
      return;
    }

    throw new Error('No se encontró la opción "Ver item" en movimientos.');
  }

  async navigateToEditedItemDetail(): Promise<void> {
    await this.openFirstMovementActions();
    await this.clickVerItemFromMovements();
  }

  async exportarItems(): Promise<import('@playwright/test').Download> {
    const downloadPromise = this.page.waitForEvent('download', { timeout: 30_000 });

    await this.page
      .locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:options"]')
      .click();

    const exportarBtn = this.page.locator('[id="lgt_cmp-items_cmp-datos-items.li:exportar-sin-filtro"]');
    await exportarBtn.waitFor({ state: 'visible', timeout: 10_000 });

    await exportarBtn.click();

    return downloadPromise;
  }
}
