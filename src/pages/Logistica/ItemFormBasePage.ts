import { type Page, type Locator } from '@playwright/test';

/**
 * Clase base abstracta para formularios de creación de ítems.
 *
 * Contiene SOLO lo que es realmente común a TODOS los tipos:
 * - Campo nombre (con override para Lista)
 * - Expandir opciones avanzadas
 * - Botón crear (con texto dinámico por tipo)
 * - Botón "Ir a lista de ítems"
 * - Navegación a tabs comunes
 * - Campos adicionales
 *
 * Lo que NO está aquí (porque no aplica a todos):
 * - Precios (insumo y lista no tienen)
 * - Stock (servicio y lista no tienen)
 * - Info adicional (varía entre 2 y 3 dropdowns según tipo)
 */
export abstract class ItemFormBasePage {
  /**
   * Ruta CSS interna del componente v-select hasta su flecha de apertura.
   * Usado como sufijo para localizar dropdowns por su contenedor padre.
   */
  protected readonly DROPDOWN_ARROW =
    '.form-control > .v-select > .v-select-form > .v-select-base > ' +
    '.v-select-base-header > .v-select-header-base-form > ' +
    '.v-select-header-form > .v-select-header-form-arrow';

  constructor(protected readonly page: Page) {}

  // ─── Locators base ───────────────────────────────────────

  /** Input de nombre del item. Override en ListaFormPage por placeholder diferente. */
  protected get inputNombre(): Locator {
    return this.page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' });
  }

  /** Botón "Crear ítems" en la barra de la lista de items */
  protected get botonCrearItems(): Locator {
    return this.page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]');
  }

  // ─── Acciones comunes ────────────────────────────────────

  /** Llena el campo nombre del item */
  async llenarNombre(nombre: string): Promise<void> {
    await this.inputNombre.click();
    await this.inputNombre.fill(nombre);
  }

  /** Expande la sección "Opciones avanzadas (opcional)" */
  async expandirOpcionesAvanzadas(): Promise<void> {
    await this.page
      .locator('div')
      .filter({ hasText: /^Opciones avanzadas \(opcional\)$/ })
      .click();
  }

  /** Clickea el botón de creación: "Crear producto", "Crear servicio", etc. */
  async clickBotonCrear(tipoItem: string): Promise<void> {
    await this.page.getByRole('button', { name: `Crear ${tipoItem}` }).click();
  }

  /** Clickea "Ir a lista de ítems" en el diálogo de éxito (SweetAlert) */
  async clickIrAListaItems(): Promise<void> {
    await this.page.getByRole('button', { name: 'Ir a lista de ítems' }).click();
  }

  // ─── Navegación a tabs dentro de opciones avanzadas ──────

  /** Navega al tab "Información adicional" */
  async irATabInfoAdicional(): Promise<void> {
    await this.page.getByText('Información adicional(').click();
  }

  /** Navega al tab "Campos adicionales" */
  async irATabCamposAdicionales(): Promise<void> {
    await this.page.getByText('Campos adicionales(Opcional)').click();
  }

  /** Navega al tab "Equivalencias" */
  async irATabEquivalencias(): Promise<void> {
    await this.page.getByText('Equivalencias(Opcional)').click();
  }

  // ─── Campos adicionales (texto, fecha, numérico) ─────────

  /** Llena el campo adicional de texto */
  async llenarCampoAdicionalTexto(texto: string): Promise<void> {
    const input = this.page.locator(
      '[id="lgt_reg-item_v-tab:campos-adicionales_grilla-campos-adicionales:campo-adicional_v-input:texto"]',
    );
    await input.click();
    await input.fill(texto);
  }

  /** Selecciona una fecha en el campo adicional de fecha */
  async seleccionarCampoAdicionalFecha(buttonName: string): Promise<void> {
    const dateInput = this.page.locator(
      '[id="lgt_reg-item_v-tab:campos-adicionales_grilla-campos-adicionales:campo-adicional_v-input:fecha"]',
    );
    await dateInput.click();
    await this.page.getByRole('button', { name: buttonName }).click();
  }

  /** Llena el campo adicional numérico */
  async llenarCampoAdicionalNumerico(valor: string): Promise<void> {
    const input = this.page.locator(
      '[id="lgt_reg-item_v-tab:campos-adicionales_grilla-campos-adicionales:campo-adicional_v-input:numerico"]',
    );
    await input.click();
    await input.fill(valor);
  }

  // ─── Helper protegido para seleccionar opciones en dropdowns v-select ──

  /**
   * Selecciona un valor en un dropdown v-select que muestra "Ninguna" por defecto.
   * @param dropdownLocator - Locator del arrow/trigger del dropdown
   * @param opcionTexto - Texto exacto de la opción a seleccionar
   */
  protected async seleccionarEnDropdown(
    dropdownLocator: Locator,
    opcionTexto: string,
  ): Promise<void> {
    await dropdownLocator.click();
    await this.page.getByText(opcionTexto, { exact: true }).click();
  }
}
