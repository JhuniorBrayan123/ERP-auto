import { Page, Locator } from '@playwright/test';
import { InventarioPage } from './InventarioPage';

/**
 * Page Object para el formulario de creación de Insumos.
 * Los insumos tienen control de stock (sin control / estricto / flexible),
 * código manual/automático, y opcionalmente equivalencias.
 */
export class InsumoPage {
  readonly page: Page;
  readonly inventario: InventarioPage;

  // Formulario básico
  readonly inputNombre: Locator;
  readonly botonCrearInsumo: Locator;

  // Stock
  readonly tabStock: Locator;
  readonly opcionSinControlStock: Locator;
  readonly opcionControlEstricto: Locator;
  readonly opcionControlFlexible: Locator;
  readonly inputCantidadAlmacenPrimero: Locator;
  readonly inputCantidadAlmacenSegundo: Locator;

  // Código
  readonly dropdownCodigo: Locator;

  // Tabs del formulario de insumo
  readonly tabInformacionAdicional: Locator;
  readonly tabEquivalencias: Locator;
  readonly tabCamposAdicionales: Locator;
  readonly tabCuarto: Locator;

  // Equivalencias
  readonly botonAquiEquivalencia: Locator;
  readonly inputNombreEquivalencia: Locator;
  readonly botonIncrementoEquivalencia: Locator;
  readonly botonCrearEquivalencia: Locator;

  // Campos adicionales
  readonly inputCampoTexto: Locator;
  readonly inputCampoFecha: Locator;
  readonly inputCampoNumerico: Locator;

  constructor(page: Page, inventario: InventarioPage) {
    this.page = page;
    this.inventario = inventario;

    this.inputNombre = page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' });
    this.botonCrearInsumo = page.getByRole('button', { name: 'Crear insumo' });

    // Stock
    this.tabStock = page.locator(
      '[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]'
    ).nth(1);
    this.opcionSinControlStock = page.locator(
      '[id="lgt_reg-item_v-tab:stock-almacen_cmp-card-stock:sin-control-stock"]'
    );
    this.opcionControlEstricto = page.locator(
      '[id="lgt_reg-item_v-tab:stock-almacen_cmp-card-stock:control-estricto"]'
    );
    this.opcionControlFlexible = page.locator(
      '[id="lgt_reg-item_v-tab:stock-almacen_cmp-card-stock:control-flexible"]'
    );
    this.inputCantidadAlmacenPrimero = page.locator(
      '[id="lgt_cmp-card-almacen_v-step:cantidad"]'
    ).first();
    this.inputCantidadAlmacenSegundo = page.locator(
      '[id="lgt_cmp-card-almacen_v-step:cantidad"]'
    ).nth(1);

    // Código manual/automático
    this.dropdownCodigo = page.locator('[id="_div:dropdown"]');

    // Tabs: para insumos tabs-2 nth(2) = Info adicional, tabs-3 nth(3) = Equivalencias/Campos
    this.tabInformacionAdicional = page.locator(
      '[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-2"]'
    ).nth(2);
    this.tabEquivalencias = page.locator(
      '[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-3"]'
    ).nth(3);
    this.tabCamposAdicionales = page.locator(
      '[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-3"]'
    ).nth(3);
    this.tabCuarto = page.locator(
      '[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-4"]'
    ).nth(4);

    // Equivalencias
    this.botonAquiEquivalencia = page.getByText('AQUÍ');
    this.inputNombreEquivalencia = page.getByRole('textbox', { name: 'Digita el nombre de la' });
    this.botonIncrementoEquivalencia = page.locator(
      '[id="lgt_reg-item_v-drape:gestion-equivalencia_v-step:cantidad_div:increase"]'
    );
    this.botonCrearEquivalencia = page.getByRole('button', { name: 'Crear Equivalencia' });

    // Campos adicionales
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

  async llenarNombre(nombre: string) {
    await this.inputNombre.fill(nombre);
  }

  // --- CÓDIGO MANUAL --- //

  /**
   * Cambia el tipo de código a Manual, llena el código, y vuelve a Automático.
   */
  async configurarCodigoManual(codigo: string) {
    await this.dropdownCodigo.click();
    await this.page.getByText('Manual').click();
    await this.page.locator(
      '[id="lgt_reg-item_v-tab:informacion-basica_v-input:codigo"]'
    ).fill(codigo);
    await this.dropdownCodigo.click();
    await this.page.getByText('Automático').click();
  }

  // --- STOCK --- //

  async irATabStock() {
    await this.tabStock.click();
  }

  async seleccionarControlStock(tipo: 'sin-control' | 'estricto' | 'flexible') {
    const opciones = {
      'sin-control': this.opcionSinControlStock,
      'estricto': this.opcionControlEstricto,
      'flexible': this.opcionControlFlexible,
    };
    await opciones[tipo].click();
  }

  async llenarCantidadesAlmacen(cantidad1: string, cantidad2: string) {
    await this.inputCantidadAlmacenPrimero.fill(cantidad1);
    await this.inputCantidadAlmacenSegundo.fill(cantidad2);
  }

  // --- INFORMACIÓN ADICIONAL (Categorización) --- //

  async irATabInformacionAdicional() {
    await this.tabInformacionAdicional.click();
    console.log("Cargando informacion adicional")
  }

  /**
   * Categorización estándar para insumos: REGRESION / AUTO-TEST / AUTOMATIZADO.
   */
  async configurarCategorizacion() {
    await this.page.getByText('Ninguna').first().click();
    await this.page.getByText('REGRESION').first().click();
    console.log("Marca")
    await this.page.getByText('Ninguna').first().click();
    await this.page.getByText('AUTO-TEST').first().click();
    console.log("Categoria")

    await this.page.getByText('Ninguna').first().click();
    await this.page.getByText('AUTOMATIZADO').first().click();
    console.log("Subcategoria")
  }

  /**
   * Categorización alternativa para insumos que usan CSS arrow selectors.
   */
  async configurarCategorizacionConArrow() {
    await this.page.getByText('Ninguna').first().click();
    await this.page.getByText('REGRESION').first().click();

    await this.page.locator(
      'div:nth-child(2) > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow'
    ).first().click();
    await this.page.getByText('AUTO-TEST').click();

    await this.page.getByText('Ninguna').first().click();
    await this.page.getByText('AUTOMATIZADO').click();
  }

  async llenarDescripcion(descripcion: string) {
    await this.inventario.inputDescripcionItem.fill(descripcion);
  }

  // --- EQUIVALENCIAS --- //

  async irATabEquivalencias() {
    await this.tabEquivalencias.click();
  }

  /**
   * Crea una equivalencia para el insumo con incrementos de cantidad.
   */
  async crearEquivalencia(nombre: string, cantidadIncrementos: number) {
    await this.botonAquiEquivalencia.click();
    await this.inputNombreEquivalencia.fill(nombre);

    for (let i = 0; i < cantidadIncrementos; i++) {
      await this.botonIncrementoEquivalencia.click();
    }

    await this.botonCrearEquivalencia.click();
    await this.inventario.esperarCarga();
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

  /**
   * Selecciona la unidad de medida "crt" en campos adicionales.
   */
  async seleccionarUnidadMedidaCrt() {
    await this.page.locator('div').filter({ hasText: /^crt$/ }).nth(2).click();
    await this.page.getByText('crt').nth(1).click();
  }

  // --- GUARDAR --- //

  async crearInsumo() {
    await this.botonCrearInsumo.click();
    await this.inventario.esperarCarga();
  }
}
