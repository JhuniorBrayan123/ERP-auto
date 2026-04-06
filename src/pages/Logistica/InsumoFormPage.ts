import { type Page, type Locator } from '@playwright/test';
import { ItemFormBasePage } from './ItemFormBasePage';

/**
 * Page Object para el formulario de creación de INSUMOS.
 *
 * Específico de insumo:
 * - NO tiene precios (a diferencia de producto/servicio)
 * - Selector de unidad de medida
 * - Código de barras
 * - Control de stock (estricto / sin control)
 * - Info adicional con 3 dropdowns (categoría, subcategoría, marca)
 */
export class InsumoFormPage extends ItemFormBasePage {
  constructor(page: Page) {
    super(page);
  }

  // ─── Inicio de creación ──────────────────────────────────

  /** Abre el menú "Crear ítems" y selecciona "Nuevo insumo" */
  async iniciarCreacionInsumo(): Promise<void> {
    await this.botonCrearItems.click();
    await this.page.getByText('INuevo insumo').click();
  }

  // ─── Unidad de medida ────────────────────────────────────

  /** Selecciona la unidad de medida (ej: KILOGRAMOS, LITROS) */
  async seleccionarUnidadMedida(unidad: string): Promise<void> {
    await this.page.locator('.v-select-header-form-arrow').first().click();
    await this.page.getByText(unidad).click();
  }

  // ─── Código de barras ────────────────────────────────────

  /** Llena el campo de código de barras */
  async llenarCodigoBarras(codigo: string): Promise<void> {
    const input = this.page.getByRole('textbox', {
      name: 'Escanea o digita el código de',
    });
    await input.click();
    await input.fill(codigo);
  }

  // ─── Stock ───────────────────────────────────────────────

  /** Navega al tab de Stock */
  async irATabStock(): Promise<void> {
    await this.page.getByText('Stock(Opcional)').click();
  }

  /** Selecciona control de stock estricto */
  async seleccionarControlEstricto(): Promise<void> {
    await this.page
      .locator('[id="lgt_reg-item_v-tab:stock-almacen_cmp-card-stock:control-estricto"]')
      .click();
  }

  /** Llena cantidades de stock */
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

  // ─── Información adicional (3 dropdowns) ─────────────────

  /**
   * Llena info adicional para insumos.
   * Insumo tiene 3 dropdowns: categoría, subcategoría, marca.
   */
  async llenarInfoAdicional(
    categoria: string,
    subcategoria: string,
    marca: string,
  ): Promise<void> {
    await this.irATabInfoAdicional();

    // Categoría
    await this.page
      .locator(`.subcategoria > ${this.DROPDOWN_ARROW}`)
      .first()
      .click();
    await this.page.getByText(categoria).click();

    // Subcategoría
    await this.page
      .locator(`div:nth-child(2) > ${this.DROPDOWN_ARROW}`)
      .first()
      .click();
    await this.page.getByText(subcategoria).click();

    // Marca
    await this.page
      .locator(`div:nth-child(3) > ${this.DROPDOWN_ARROW}`)
      .click();
    await this.page.getByText(marca).click();
  }

  // ─── Creación ────────────────────────────────────────────

  /** Clickea "Crear insumo" */
  async crearInsumo(): Promise<void> {
    await this.clickBotonCrear('insumo');
  }
}
