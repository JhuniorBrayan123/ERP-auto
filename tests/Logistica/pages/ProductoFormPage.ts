import { type Page } from '@playwright/test';
import { ItemFormBasePage } from './ItemFormBasePage';
import type { StockConfig, ISCConfig } from '../helpers/item-data.types';

/**
 * Page Object para el formulario de creación de PRODUCTOS.
 *
 * Específico de producto:
 * - Precios de venta y compra
 * - Control de stock (estricto / flexible) con cantidades
 * - Tipo de afectación IGV (gravado, exonerado)
 * - Impuestos adicionales: ICBPER, ISC
 * - Info adicional con 3 dropdowns (categoría, subcategoría, marca)
 */
export class ProductoFormPage extends ItemFormBasePage {
  constructor(page: Page) {
    super(page);
  }

  // ─── Inicio de creación ──────────────────────────────────

  /** Abre el menú "Crear ítems" y selecciona "Nuevo producto" */
  async iniciarCreacionProducto(): Promise<void> {
    await this.botonCrearItems.click();
    await this.page.getByText('PNuevo producto').click();
  }

  // ─── Precios ─────────────────────────────────────────────

  /**
   * Llena precio de venta y precio de compra.
   * Nota: Ambos inputs tienen el mismo role "Monto final".
   * Se distinguen por posición: first() = venta, nth(1) = compra.
   */
  async llenarPrecios(precioVenta: string, precioCompra: string): Promise<void> {
    const inputPrecioVenta = this.page.getByRole('textbox', { name: 'Monto final' }).first();
    const inputPrecioCompra = this.page.getByRole('textbox', { name: 'Monto final' }).nth(1);

    await inputPrecioVenta.click();
    await inputPrecioVenta.fill(precioVenta);
    await inputPrecioCompra.click();
    await inputPrecioCompra.fill(precioCompra);
  }

  // ─── Stock ───────────────────────────────────────────────

  /** Navega al tab de Stock dentro de opciones avanzadas */
  async irATabStock(): Promise<void> {
    await this.page
      .locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]')
      .nth(1)
      .click();
  }

  /** Selecciona el tipo de control de stock */
  async seleccionarControlStock(tipo: 'estricto' | 'flexible'): Promise<void> {
    const id =
      tipo === 'estricto'
        ? 'lgt_reg-item_v-tab:stock-almacen_cmp-card-stock:control-estricto'
        : 'lgt_reg-item_v-tab:stock-almacen_cmp-card-stock:control-flexible';
    await this.page.locator(`[id="${id}"]`).click();
  }

  /** Llena las cantidades máxima y mínima de stock */
  async llenarCantidadesStock(cantidadMaxima: string, cantidadMinima: string): Promise<void> {
    const inputMax = this.page
      .locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]')
      .first();
    const inputMin = this.page
      .locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]')
      .nth(1);

    await inputMax.click();
    await inputMax.fill(cantidadMaxima);
    await inputMin.click();
    await inputMin.fill(cantidadMinima);
  }

  /** Configura stock completo: selecciona tipo y llena cantidades */
  async configurarStock(config: StockConfig): Promise<void> {
    await this.irATabStock();
    await this.seleccionarControlStock(config.tipo);
    await this.llenarCantidadesStock(config.cantidadMaxima, config.cantidadMinima);
  }

  // ─── Tipo de afectación IGV ──────────────────────────────

  /** Cambia el tipo de afectación IGV (ej: "Exonerado (No paga IGV)") */
  async seleccionarTipoAfectacionIGV(opcionTexto: string): Promise<void> {
    await this.page.locator('.v-select-header-form-arrow.form.form-control').click();
    await this.page.getByText(opcionTexto, { exact: true }).click();
  }

  // ─── Impuestos adicionales ───────────────────────────────

  /** Activa el switch de ICBPER (Bolsas plásticas) */
  async activarICBPER(): Promise<void> {
    await this.page
      .locator(
        '.impuestos > div:nth-child(2) > .v-switch > .switch-content > .switch > .slider',
      )
      .first()
      .click();
  }

  /** Activa y configura ISC */
  async configurarISC(config: ISCConfig): Promise<void> {
    // Activar switch ISC
    await this.page
      .locator(
        '.row > div:nth-child(2) > div:nth-child(2) > .v-switch > .switch-content > .switch > .slider',
      )
      .click();

    // Seleccionar tipo de sistema ISC
    if (config.tipoSistema === 'Sistema al valor') {
      await this.page.locator('.v-select-header-form-arrow.invalid').click();
      await this.page
        .locator('div')
        .filter({ hasText: /^Sistema al valor$/ })
        .click();
    } else {
      await this.page
        .locator('div')
        .filter({ hasText: /^Tipo de sistema ISC$/ })
        .nth(2)
        .click();
      await this.page.getByText('Aplicación al monto fijo').click();
    }

    // Llenar monto
    const inputMonto = this.page.getByRole('textbox', { name: 'Monto', exact: true });
    await inputMonto.click();
    await inputMonto.fill(config.monto);
  }

  // ─── Información adicional (3 dropdowns) ─────────────────

  /**
   * Llena la sección de información adicional para productos.
   * Producto tiene 3 dropdowns: categoría, subcategoría, marca.
   */
  async llenarInfoAdicional(
    categoria: string,
    subcategoria: string,
    marca: string,
  ): Promise<void> {
    await this.irATabInfoAdicional();

    // Categoría — primer dropdown en sección .subcategoria
    await this.page
      .locator(`.subcategoria > ${this.DROPDOWN_ARROW}`)
      .first()
      .click();
    await this.page.locator('div').filter({ hasText: new RegExp(`^${categoria}$`) }).click();

    // Subcategoría — segundo dropdown (nth-child(2))
    await this.page
      .locator(`div:nth-child(2) > ${this.DROPDOWN_ARROW}`)
      .click();
    await this.page.getByText(subcategoria).click();

    // Marca — tercer dropdown (nth-child(3))
    await this.page
      .locator(`div:nth-child(3) > ${this.DROPDOWN_ARROW}`)
      .click();
    await this.page.getByText(marca).click();
  }

  // ─── Método de creación completa ─────────────────────────

  /** Clickea "Crear producto" */
  async crearProducto(): Promise<void> {
    await this.clickBotonCrear('producto');
  }
}
