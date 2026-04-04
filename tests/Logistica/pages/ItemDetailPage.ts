import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object para la vista de detalle de un item ya creado.
 * Accesible desde la lista de ítems mediante el menú de opciones.
 *
 * Responsabilidades:
 * - Abrir menús de opciones en la lista
 * - Navegar a Ver Ítem / Visualizar Ítem
 * - Navegar entre tabs (Ventas, Compras, Bitácora, Ver listado)
 * - Leer datos del detalle para assertions
 */
export class ItemDetailPage {
  constructor(private readonly page: Page) {}

  // ─── Menú de opciones en la lista de items ───────────────

  /** Abre el menú desplegable de opciones del primer item de la lista */
  async abrirMenuAccionesItem(): Promise<void> {
    await this.page
      .locator(
        '.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle',
      )
      .first()
      .click();
  }

  /** Clickea "Visualizar item" desde el menú de opciones → abre modal de stock */
  async clickVisualizarItem(): Promise<void> {
    await this.page
      .locator(
        '[id="lgt_items_cmp-grid-item-option:opciones_items_cmp-dropdown:options-li:visualizar-item"]',
      )
      .click();
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
    await this.page
      .locator(
        '[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]',
      )
      .click();
  }

  // ─── Tabs dentro de Ver Ítem ─────────────────────────────

  /** Navega al tab de Ventas */
  async irATabVentas(): Promise<void> {
    await this.page
      .locator(
        '[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:ventas"]',
      )
      .click();
  }

  /** Navega al tab de Compras */
  async irATabCompras(): Promise<void> {
    await this.page
      .locator(
        '[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:compras"]',
      )
      .click();
  }

  /** Navega al tab de Bitácora */
  async irATabBitacora(): Promise<void> {
    await this.page
      .locator(
        '[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:bitacora"]',
      )
      .click();
  }

  /** Navega al tab de Bitácora usando texto (alternativa más estable en ciertos contextos) */
  async irATabBitacoraPorTexto(): Promise<void> {
    await this.page.getByText('Bitácora').click();
  }

  /** Clickea "Ver listado" (específico de listas) */
  async clickVerListado(): Promise<void> {
    await this.page.locator('div').filter({ hasText: /^Ver listado$/ }).click();
  }

  /** Clickea el botón "Atrás" para regresar a la lista de ítems */
  async clickAtras(): Promise<void> {
    await this.page.getByRole('button', { name: 'Atrás' }).click();
  }

  // ─── Flujos compuestos de verificación ───────────────────

  /**
   * Flujo completo: abrir menú → ver item → verificar tabs → bitácora → atrás.
   * Usado cuando se accede directamente desde el menú de la lista.
   */
  async verificarItemDesdeMenu(opciones: {
    verificarVentas?: boolean;
    verificarCompras?: boolean;
    verificarBitacora?: boolean;
  }): Promise<void> {
    await this.abrirMenuAccionesItem();
    await this.clickVerItem();
    if (opciones.verificarVentas) await this.irATabVentas();
    if (opciones.verificarCompras) await this.irATabCompras();
    if (opciones.verificarBitacora) await this.irATabBitacora();
    await this.clickAtras();
  }

  /**
   * Flujo: abrir menú → visualizar item (modal stock) → cerrar → ícono → ver item → tabs → atrás.
   * Usado cuando se quiere verificar tanto el stock modal como el detalle completo.
   */
  async verificarItemCompleto(opciones: {
    verificarVentas?: boolean;
    verificarCompras?: boolean;
    verificarBitacora?: boolean;
  }): Promise<void> {
    await this.abrirMenuAccionesItem();
    await this.clickVisualizarItem();
    await this.cerrarModalVisualizacion();
    await this.clickIconoAcciones();
    await this.clickVerItem();
    if (opciones.verificarVentas) await this.irATabVentas();
    if (opciones.verificarCompras) await this.irATabCompras();
    if (opciones.verificarBitacora) await this.irATabBitacora();
    await this.clickAtras();
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
