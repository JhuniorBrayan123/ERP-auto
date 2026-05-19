import { type Page, type Locator } from '@playwright/test';

export class ItemDetailPage {
  constructor(private readonly page: Page) {}

  private readonly overloadLoading = this.page.locator('[id="cmn_cmp-overload:loading"]');

  private readonly tabVentas = this.page.locator(
    '[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:ventas"]',
  );

  private readonly tabCompras = this.page.locator(
    '[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:compras"]',
  );

  private readonly tabBitacora = this.page.locator(
    '[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:bitacora"]',
  );

  private readonly toggleAccionesItem = this.page
    .locator(
      '.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle',
    )
    .first();

  async abrirMenuAccionesItem(): Promise<void> {
    await this.toggleAccionesItem.click();
  }

  private async esperarListadoCargado(): Promise<void> {
    await this.overloadLoading.waitFor({ state: 'hidden', timeout: 35_000 }).catch(() => {});
    await this.toggleAccionesItem.waitFor({ state: 'visible', timeout: 25_000 });
  }

  private async clickOpcionVerItemPorTexto(): Promise<boolean> {
    const option = this.page.getByText(/^Ver [ií]tem$/i).first();
    try {
      await option.waitFor({ state: 'visible', timeout: 2000 });
      await option.click();
      return true;
    } catch {
      return false;
    }
  }

  async clickVisualizarItem(): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt++) {
      if (await this.clickOpcionVerItemPorTexto()) return;

      await this.abrirMenuAccionesItem();
    }

    throw new Error('No se encontró la opción "Ver item" en la grilla de ítems.');
  }

  async clickVerItemDesdeItems(): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt++) {
      if (await this.clickOpcionVerItemPorTexto()) return;
      await this.abrirMenuAccionesItem();
    }

    throw new Error('No se encontró la opción "Ver item" en el menú de ítems.');
  }

  async cerrarModalVisualizacion(): Promise<void> {
    await this.page.locator('.v-modal > div').first().click();
  }

  async clickIconoAcciones(): Promise<void> {
    await this.page.locator('.v-icon-base > .icon').first().click();
  }

  async clickVerItem(): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt++) {
      if (await this.clickOpcionVerItemPorTexto()) return;

      await this.clickIconoAcciones();
    }

    throw new Error('No se encontró la opción "Ver item" en el menú de movimientos.');
  }

  async irATabVentas(): Promise<void> {
    await this.tabVentas.click();
  }

  async irATabCompras(): Promise<void> {
    await this.tabCompras.click();
  }

  async irATabBitacora(): Promise<void> {
    await this.overloadLoading.waitFor({ state: 'hidden', timeout: 35_000 }).catch(() => {});
    await this.tabBitacora.click();
  }

  async irATabBitacoraPorTexto(): Promise<void> {
    await this.irATabBitacora();
  }

  async clickVerListado(): Promise<void> {
    await this.page.locator('div').filter({ hasText: /^Ver listado$/ }).click();
  }

  async clickAtras(): Promise<void> {
    await this.page.getByRole('button', { name: 'Atrás' }).click();
  }

  async irATabComprasOVentasDisponible(): Promise<'compras' | 'ventas'> {
    if (await this.tabCompras.isVisible()) {
      await this.irATabCompras();
      return 'compras';
    }

    if (await this.tabVentas.isVisible()) {
      await this.irATabVentas();
      return 'ventas';
    }

    throw new Error('No se encontró la pestaña de Compras ni la de Ventas en el detalle del item.');
  }

  private async verificarTabs(opciones: {
    verificarVentas?: boolean;
    verificarCompras?: boolean;
    verificarComprasOVentas?: boolean;
    verificarBitacora?: boolean;
  }): Promise<void> {
    if (opciones.verificarVentas) await this.irATabVentas();
    if (opciones.verificarCompras) await this.irATabCompras();
    if (opciones.verificarComprasOVentas) await this.irATabComprasOVentasDisponible();
    if (opciones.verificarBitacora) await this.irATabBitacora();
  }

  async verificarItemDesdeMenu(opciones: {
    verificarVentas?: boolean;
    verificarCompras?: boolean;
    verificarComprasOVentas?: boolean;
    verificarBitacora?: boolean;
  }): Promise<void> {
    await this.esperarListadoCargado();
    await this.abrirMenuAccionesItem();
    await this.clickVerItemDesdeItems();
    await this.verificarTabs(opciones);
    await this.clickAtras();
  }

  async verificarItemCompleto(opciones: {
    verificarVentas?: boolean;
    verificarCompras?: boolean;
    verificarComprasOVentas?: boolean;
    verificarBitacora?: boolean;
  }): Promise<void> {
    await this.verificarItemDesdeMenu(opciones);
  }

  async getBitacoraContent(): Promise<string> {
    await this.irATabBitacora();
    const bitacoraSection = this.page.locator('.bitacora, [class*="bitacora"]').first();
    if (await bitacoraSection.isVisible()) {
      return await bitacoraSection.textContent() ?? '';
    }
    return '';
  }
}
