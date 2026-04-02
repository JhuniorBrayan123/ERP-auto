import { Page, Locator } from '@playwright/test';
import { InventarioPage } from './InventarioPage';

/**
 * Page Object para el formulario de creación de Combos.
 * Los combos contienen ítems hijos que pueden ser: normales, equivalentes, 
 * variantes, selectores u otros combos.
 */
export class ComboPage {
  readonly page: Page;
  readonly inventario: InventarioPage;

  // Formulario básico
  readonly inputNombre: Locator;
  readonly inputMontoSoles: Locator;
  readonly inputMontoDolares: Locator;
  readonly botonCrearCombo: Locator;

  // Tabs
  readonly tabAnadirItems: Locator;
  readonly tabInformacionAdicional: Locator;
  readonly tabCamposAdicionales: Locator;

  // Búsqueda de ítems
  readonly inputBuscarItem: Locator;

  // Campos adicionales
  readonly inputCampoTexto: Locator;
  readonly inputCampoFecha: Locator;
  readonly inputCampoNumerico: Locator;

  constructor(page: Page, inventario: InventarioPage) {
    this.page = page;
    this.inventario = inventario;

    this.inputNombre = page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' });
    this.inputMontoSoles = page.getByRole('textbox', { name: 'Monto final' }).first();
    this.inputMontoDolares = page.getByRole('textbox', { name: 'Monto final' }).nth(1);
    this.botonCrearCombo = page.getByRole('button', { name: 'Crear combo' });

    // Para combos: tabs-1 nth(1) = Añadir ítems, tabs-1 nth(2) = Info adicional
    this.tabAnadirItems = page.locator(
      '[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]'
    ).nth(1);
    this.tabInformacionAdicional = page.locator(
      '[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]'
    ).nth(2);
    this.tabCamposAdicionales = page.locator(
      '[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-3"]'
    ).nth(3);

    this.inputBuscarItem = page.getByRole('textbox', { name: 'Buscar nombre del producto, c' });

    this.inputCampoTexto = page.locator(
      '[id="lgt_reg-item_v-tab:campos-adicionales_grilla-campos-adicionales:campo-adicional_v-input:texto"]'
    );
    this.inputCampoFecha = page.locator(
      '[id="lgt_reg-item_v-tab:campos-adicionales_grilla-campos-adicionales:campo-adicional_v-input:fecha"]'
    );
    this.inputCampoNumerico = page.locator(
      '[id="lgt_reg-item_v-tab:campos-adicionales_grilla-campos-adicionales:campo-adicional_v-input:numerico"]'
    );
  }

  // --- DATOS BÁSICOS --- //

  async llenarNombreYPrecios(nombre: string, montoSoles: string, montoDolares: string) {
    await this.inputNombre.fill(nombre);
    await this.inputMontoSoles.fill(montoSoles);
    await this.inputMontoDolares.fill(montoDolares);
  }

  // --- TABS --- //

  async irATabAnadirItems() {
    await this.tabAnadirItems.click();
  }

  async irATabInformacionAdicional() {
    await this.tabInformacionAdicional.click();
  }

  // --- BÚSQUEDA Y ADICIÓN DE ÍTEMS --- //

  /**
   * Busca un ítem normal por código y lo selecciona.
   */
  async buscarYAgregarItem(codigoBusqueda: string, textoResultado: string) {
    await this.inputBuscarItem.click();
    await this.inputBuscarItem.fill(codigoBusqueda);
    await this.page.getByText(textoResultado).click();
  }

  /**
   * Busca un ítem con equivalencia: selecciona el producto y luego la variante de equivalencia.
   */
  async buscarYAgregarItemEquivalente(
    codigoBusqueda: string,
    textoProducto: string,
    textoEquivalencia: string
  ) {
    await this.inputBuscarItem.click();
    await this.inputBuscarItem.fill(codigoBusqueda);
    await this.page.getByText(textoProducto).click();
    await this.page.getByText(textoEquivalencia).click();
  }

  /**
   * Busca un ítem con variante: selecciona el producto y luego elige variante(s) del modal.
   * @param indicesVariante - Índices de las variantes a seleccionar en el modal (0-based)
   */
  async buscarYAgregarItemVariante(
    codigoBusqueda: string,
    textoProducto: string,
    indicesVariante: number[]
  ) {
    await this.inputBuscarItem.click();
    await this.inputBuscarItem.fill(codigoBusqueda);
    await this.page.getByText(textoProducto).click();

    for (const indice of indicesVariante) {
      if (indice === 0) {
        await this.page.locator('.producto').first().click();
      } else {
        await this.page.locator(`.v-modal-body > div:nth-child(${indice + 1})`).click();
      }
    }
  }

  /**
   * Busca un ítem selector por código y lo selecciona.
   */
  async buscarYAgregarItemSelector(codigoBusqueda: string, textoResultado: string) {
    await this.inputBuscarItem.click();
    await this.inputBuscarItem.pressSequentially(codigoBusqueda, { delay: 50 });
    await this.page.getByText(textoResultado).click();
  }

  /**
   * Limpia el campo de búsqueda antes de una nueva búsqueda.
   */
  async limpiarBusqueda() {
    await this.inputBuscarItem.click();
    await this.inputBuscarItem.fill('');
  }

  // --- CATEGORIZACIÓN --- //

  /**
   * Categorización estándar para combos con subcategoría y familia usando CSS arrows.
   */
  async configurarCategorizacionConArrow() {
    await this.page.locator(
      '.subcategoria > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow'
    ).first().click();
    await this.page.getByText('AUTO-TEST').click();

    await this.page.locator(
      'div:nth-child(2) > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow'
    ).click();
    await this.page.getByText('AUTOMATIZADO').click();
  }

  /**
   * Categorización usando selectores por texto Ninguna (para combos con equivalentes/variantes).
   */
  async configurarCategorizacionConNinguna() {
    await this.page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
    await this.page.locator('div').filter({ hasText: /^AUTO-TEST$/ }).nth(2).click();

    await this.page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
    await this.page.locator('div').filter({ hasText: /^AUTOMATIZADO$/ }).nth(2).click();
  }

  /**
   * Categorización alternativa: Ninguna → AUTO-TEST, luego Ninguna → AUTOMATIZADO (primer match).
   */
  async configurarCategorizacionAutoTestFirst() {
    await this.page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
    await this.page.locator('div').filter({ hasText: /^AUTO-TEST$/ }).first().click();

    await this.page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
    await this.page.locator('div').filter({ hasText: /^AUTOMATIZADO$/ }).nth(2).click();
  }

  // --- CAMPOS ADICIONALES --- //

  async irATabCamposAdicionales() {
    await this.page.getByText('Campos adicionales(Opcional)').click();
  }

  async llenarCamposAdicionales(texto: string, numerico: string) {
    await this.inputCampoTexto.fill(texto);
    await this.inputCampoFecha.click();
    const diaValido = this.page.locator('.v-date-picker-table tbody button').first();
    await diaValido.click({ timeout: 5000 });
    await this.inputCampoNumerico.fill(numerico);
  }

  // --- GUARDAR --- //

  async crearCombo() {
    await this.botonCrearCombo.click();
    await this.inventario.esperarCarga();
  }
}
