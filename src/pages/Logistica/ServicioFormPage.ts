import { type Page } from '@playwright/test';
import { ItemFormBasePage } from './ItemFormBasePage';

/**
 * Page Object para el formulario de creación de SERVICIOS.
 *
 * Específico de servicio:
 * - Precios de venta y compra
 * - Tipo de afectación IGV (gravado, exonerado, inafecto)
 * - NO tiene tab de stock
 * - Info adicional con 3 dropdowns (categoría, subcategoría, marca)
 */
export class ServicioFormPage extends ItemFormBasePage {
  constructor(page: Page) {
    super(page);
  }

  // ─── Inicio de creación ──────────────────────────────────

  /** Abre el menú "Crear ítems" y selecciona "Nuevo servicio" */
  async iniciarCreacionServicio(): Promise<void> {
    await this.botonCrearItems.click();
    await this.page.getByText('SNuevo servicio').click();
  }

  // ─── Precios ─────────────────────────────────────────────

  /** Llena precio de venta y compra (first = venta, nth(1) = compra) */
  async llenarPrecios(precioVenta: string, precioCompra: string): Promise<void> {
    const inputPrecioVenta = this.page.getByRole('textbox', { name: 'Monto final' }).first();
    const inputPrecioCompra = this.page.getByRole('textbox', { name: 'Monto final' }).nth(1);

    await inputPrecioVenta.click();
    await inputPrecioVenta.fill(precioVenta);
    await inputPrecioCompra.click();
    await inputPrecioCompra.fill(precioCompra);
  }

  // ─── Tipo de afectación IGV ──────────────────────────────

  /** Cambia el tipo de afectación IGV (ej: "Exonerado (No paga IGV)") */
  async seleccionarTipoAfectacionIGV(opcionTexto: string): Promise<void> {
    await this.page.locator('.v-select-header-form-arrow.form.form-control').click();
    await this.page.getByText(opcionTexto, { exact: true }).click();
  }

  // ─── Opciones avanzadas ──────────────────────────────────

  /** Expande opciones avanzadas para servicio usando el ícono alternativo */
  async expandirOpcionesAvanzadasServicio(): Promise<void> {
    await this.page.locator('.advance > .icon').click();
  }

  // ─── Información adicional (3 dropdowns) ─────────────────

  /**
   * Llena info adicional para servicios.
   * Servicio tiene 3 dropdowns: categoría, subcategoría, marca.
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
      .click();
    await this.page.getByText(subcategoria).click();

    // Marca
    await this.page
      .locator(`div:nth-child(3) > ${this.DROPDOWN_ARROW}`)
      .click();
    await this.page.getByText(marca).click();
  }

  // ─── Creación ────────────────────────────────────────────

  /** Clickea "Crear servicio" */
  async crearServicio(): Promise<void> {
    await this.clickBotonCrear('servicio');
  }
}
