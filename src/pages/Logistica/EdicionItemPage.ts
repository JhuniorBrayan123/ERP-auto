import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object para el formulario de edición y clonado de ítems.
 *
 * Responsabilidades:
 * - Actualizar nombre del item
 * - Actualizar precios (venta y compra)
 * - Seleccionar tipo de afectación IGV con scroll dentro del dropdown
 * - Confirmar actualización o clonado
 * - Cerrar modal de éxito post-actualización
 * - Navegar a lista de ítems post-clonado (SweetAlert)
 *
 * NO contiene assertions — eso queda en el spec.
 */
export class EdicionItemPage {
  constructor(private readonly page: Page) {}

  // ─── Locators ───────────────────────────────────────────────

  private get inputNombre(): Locator {
    return this.page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' });
  }

  private get inputPrecioSoles(): Locator {
    return this.page.getByRole('textbox', { name: 'Monto final' }).first();
  }

  private get inputPrecioDolares(): Locator {
    return this.page.getByRole('textbox', { name: 'Monto final' }).nth(1);
  }

  // ─── Edición de nombre ──────────────────────────────────────

  /**
   * Reemplaza el nombre actual del item con uno nuevo.
   * Limpia el campo antes de escribir para evitar concatenación.
   */
  async updateName(newName: string): Promise<void> {
    await this.inputNombre.click();
    await this.inputNombre.clear();
    await this.inputNombre.fill(newName);
  }

  // ─── Edición de precios ─────────────────────────────────────

  /** Actualiza el precio estándar en soles (primer Monto final) */
  async updatePrecioSoles(precio: string): Promise<void> {
    await this.inputPrecioSoles.click();
    await this.inputPrecioSoles.clear();
    await this.inputPrecioSoles.fill(precio);
  }

  /** Actualiza el precio en dólares (segundo Monto final) */
  async updatePrecioDolares(precio: string): Promise<void> {
    await this.inputPrecioDolares.click();
    await this.inputPrecioDolares.clear();
    await this.inputPrecioDolares.fill(precio);
  }

  /** Actualiza ambos precios (soles y dólares) */
  async updatePrices(precioSoles: string, precioDolares: string): Promise<void> {
    await this.updatePrecioSoles(precioSoles);
    await this.updatePrecioDolares(precioDolares);
  }

  // ─── Selección de tipo de afectación IGV ────────────────────

  /**
   * Selecciona un tipo de afectación IGV del dropdown scrolleable.
   *
   * Comportamiento:
   * 1. Abre el dropdown de tipo de afectación
   * 2. Localiza la opción por texto exacto
   * 3. Si la opción no es visible, hace scroll DENTRO del dropdown (no en la página)
   * 4. Clickea la opción
   *
   * Opciones soportadas:
   * - Gravado (Paga IGV 18%)
   * - Gravado - Retiro por premio (Paga IGV 18%)
   * - Gravado - Retiro por donacion (Paga IGV 18%)
   * - Gravado - Retiro (Paga IGV 18%)
   * - Gravado - Retiro por publicidad (Paga IGV 18%)
   * - Gravado - Bonificaciones (Paga IGV 18%)
   * - Gravado - Retiro por entrega a trabajadores (Paga IGV 18%)
   * - Exonerado (No paga IGV)
   * - Exonerado - Transferencia Gratuita
   * - Inafecto (No paga IGV)
   * - Inafecto - Retiro por Bonificación
   * - Inafecto - Retiro
   * - Inafecto - Retiro por Muestras Médicas
   * - Inafecto - Retiro por Convenio Colectivo
   * - Inafecto - Retiro por Premio
   * - Inafecto - Retiro por Publicidad
   * - Exportación
   *
   * @param optionText - Texto exacto de la opción a seleccionar
   */
  async selectAffectationType(optionText: string): Promise<void> {
    // 1. Abrir el dropdown de tipo de afectación
    await this.page
      .locator('.v-select-header-form-arrow.form.form-control')
      .click();

    // 2. Localizar la opción por texto exacto DENTRO de las opciones del dropdown
    //    Usamos .v-select-form-option para apuntar solo a las opciones del listado,
    //    evitando los divs anidados del header del v-select que contienen el mismo texto.
    const option = this.page
      .locator('.v-select-form-option')
      .getByText(optionText, { exact: true });

    // 3. Scroll dentro del dropdown (no en la página completa)
    //    scrollIntoViewIfNeeded scrollea el ancestor scrolleable más cercano
    await option.scrollIntoViewIfNeeded();

    // 4. Clickear la opción
    await option.click();
  }

  // ─── Botones de acción ──────────────────────────────────────

  /** Clickea "Actualizar producto" para confirmar la edición */
  async clickActualizarProducto(): Promise<void> {
    await this.page.getByRole('button', { name: 'Actualizar producto' }).click();
  }

  /** Clickea "Clonar producto" para confirmar el clonado */
  async clickClonarProducto(): Promise<void> {
    await this.page.getByRole('button', { name: 'Clonar producto' }).click();
  }

  // ─── Modales post-acción ────────────────────────────────────

  /**
   * Cierra el modal de éxito que aparece después de una actualización.
   * Este modal es diferente al SweetAlert de creación/clonado.
   */
  async closeSuccessModal(): Promise<void> {
    await this.page.locator('.v-modal > div').first().click();
  }

  /** Clickea "Ir a lista de ítems" en el SweetAlert post-clonado */
  async clickIrAListaItems(): Promise<void> {
    await this.page.getByRole('button', { name: 'Ir a lista de ítems' }).click();
  }
}
