import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object para la vista de detalle de un item ya creado.
 * Accesible desde la lista de ítems mediante el menú de opciones.
 *
 * Responsabilidades:
 * - Abrir menús de opciones en la lista
 * - Navegar a Ver item
 * - Navegar entre tabs (Ventas, Compras, Bitácora, Ver listado)
 * - Leer datos del detalle para assertions
 */
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

  // ─── Menú de opciones en la lista de items ───────────────

  /** Abre el menú desplegable de opciones del primer item de la lista */
  async abrirMenuAccionesItem(): Promise<void> {
    await this.toggleAccionesItem.click();
  }

  private async esperarListadoCargado(): Promise<void> {
    await this.overloadLoading.waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => {});
    await this.toggleAccionesItem.waitFor({ state: 'visible', timeout: 15_000 });
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

  /** Clickea "Ver item" desde el menú de opciones → abre modal de stock */
  async clickVisualizarItem(): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt++) {
      if (await this.clickOpcionVerItemPorTexto()) return;

      // Si la opción no está visible, volvemos a abrir acciones del item.
      await this.abrirMenuAccionesItem();
    }

    throw new Error('No se encontró la opción "Ver item" en la grilla de ítems.');
  }

  /** Clickea "Ver item" desde el menú de la grilla de ítems */
  async clickVerItemDesdeItems(): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt++) {
      if (await this.clickOpcionVerItemPorTexto()) return;
      await this.abrirMenuAccionesItem();
    }

    throw new Error('No se encontró la opción "Ver item" en el menú de ítems.');
  }

  /** Cierra el modal de visualización de stock */
  async cerrarModalVisualizacion(): Promise<void> {
    await this.page.locator('.v-modal > div').first().click();
  }

  /** Clickea el ícono para acceder a opciones de movimiento */
  async clickIconoAcciones(): Promise<void> {
    await this.page.locator('.v-icon-base > .icon').first().click();
  }

  /** Clickea "Ver item" desde el menú de opciones de movimiento */
  async clickVerItem(): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt++) {
      if (await this.clickOpcionVerItemPorTexto()) return;

      // Si no se ve la opción, reabrimos menú de movimientos.
      await this.clickIconoAcciones();
    }

    throw new Error('No se encontró la opción "Ver item" en el menú de movimientos.');
  }

  // ─── Tabs dentro de Ver Ítem ─────────────────────────────

  /** Navega al tab de Ventas */
  async irATabVentas(): Promise<void> {
    await this.tabVentas.click();
  }

  /** Navega al tab de Compras */
  async irATabCompras(): Promise<void> {
    await this.tabCompras.click();
  }

  /** Navega al tab de Bitácora */
  async irATabBitacora(): Promise<void> {
    // A veces el ERP muestra un overlay de carga que intercepta clicks.
    // Esperamos a que desaparezca para evitar timeouts por "intercepts pointer events".
    await this.overloadLoading.waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => {});
    await this.tabBitacora.click();
  }

  /** Navega al tab de Bitácora (evita `getByText('Bitácora')`: choca con "Descargar PDF (Bitácora)"). */
  async irATabBitacoraPorTexto(): Promise<void> {
    await this.irATabBitacora();
  }

  /** Clickea "Ver listado" (específico de listas) */
  async clickVerListado(): Promise<void> {
    await this.page.locator('div').filter({ hasText: /^Ver listado$/ }).click();
  }

  /** Clickea el botón "Atrás" para regresar a la lista de ítems */
  async clickAtras(): Promise<void> {
    await this.page.getByRole('button', { name: 'Atrás' }).click();
  }

  /** Navega a Compras o Ventas según la pestaña que esté disponible en el detalle. */
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

  // ─── Flujos compuestos de verificación ───────────────────

  /**
   * Flujo completo: abrir menú → ver item → verificar tabs → bitácora → atrás.
   * Usado cuando se accede directamente desde el menú de la lista.
   */
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

  /**
   * Flujo: abrir menú → visualizar item (modal stock) → cerrar → ícono → ver item → tabs → atrás.
   * Usado cuando se quiere verificar tanto el stock modal como el detalle completo.
   */
  async verificarItemCompleto(opciones: {
    verificarVentas?: boolean;
    verificarCompras?: boolean;
    verificarComprasOVentas?: boolean;
    verificarBitacora?: boolean;
  }): Promise<void> {
    await this.verificarItemDesdeMenu(opciones);
  }

  // ─── Lectura de datos para assertions ────────────────────

  /** Lee el contenido visible de la sección de bitácora */
  async getBitacoraContent(): Promise<string> {
    await this.irATabBitacora();
    const bitacoraSection = this.page.locator('.bitacora, [class*="bitacora"]').first();
    if (await bitacoraSection.isVisible()) {
      return await bitacoraSection.textContent() ?? '';
    }
    return '';
  }
}
