import { Page, Locator } from '@playwright/test';
import { InventarioPage } from './InventarioPage';

/**
 * Page Object para el formulario de creación de Servicios.
 * Los servicios NO tienen stock ni ítems hijos — solo nombre, precios, afectación y categorización.
 */
export class ServicioPage {
  readonly page: Page;
  readonly inventario: InventarioPage;

  // Formulario básico
  readonly inputNombre: Locator;
  readonly inputMontoSoles: Locator;
  readonly inputMontoDolares: Locator;
  readonly botonCrearServicio: Locator;

  // Tabs del formulario de servicio
  readonly tabInformacionAdicional: Locator;
  readonly tabCamposAdicionales: Locator;

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
    this.botonCrearServicio = page.getByRole('button', { name: 'Crear servicio' });

    // Para servicios: tabs-1 nth(1) = Info adicional, tabs-3 nth(2) = Campos adicionales
    this.tabInformacionAdicional = page.locator(
      '[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]'
    ).nth(1);
    this.tabCamposAdicionales = page.locator(
      '[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-3"]'
    ).nth(2);

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

  /**
   * Cambia la afectación tributaria de Gravado a Inafecto.
   * Solo se usa cuando el servicio NO es gravado (que es el default).
   */
  async seleccionarAfectacionInafecto() {
    await this.page.locator('div').filter({ hasText: /^Gravado \(Paga IGV 18%\)$/ }).nth(2).click();
    await this.page.locator('div').filter({ hasText: /^Inafecto \(No paga IGV\)$/ }).click();
  }

  // --- INFORMACIÓN ADICIONAL (Categorización) --- //

  async irATabInformacionAdicional() {
    await this.tabInformacionAdicional.click();
  }

  /**
   * Selecciona Categoría REGRESION, Subcategoría AUTO-TEST, Familia AUTOMATIZADO.
   * Patrón estándar para servicios.
   */
  async configurarCategorizacion() {
    await this.page.locator('div').filter({ hasText: /^REGRESION$/ }).nth(2).click();
    await this.page.locator('div').filter({ hasText: /^REGRESION$/ }).nth(4).click();

    await this.page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
    await this.page.getByText('AUTO-TEST').click();

    await this.page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
    await this.page.getByText('AUTOMATIZADO').click();
  }

  /**
   * Categorización alternativa para servicio inafecto (usa selector CSS para familia).
   */
  async configurarCategorizacionInafecto() {
    await this.page.locator('div').filter({ hasText: /^REGRESION$/ }).nth(2).click();
    await this.page.locator('div').filter({ hasText: /^REGRESION$/ }).nth(4).click();

    await this.page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
    await this.page.locator('div').filter({ hasText: /^AUTO-TEST$/ }).nth(2).click();

    await this.page.locator(
      'div:nth-child(3) > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow'
    ).click();
    await this.page.getByText('AUTOMATIZADO').click();
  }

  async llenarDescripcion(descripcion: string) {
    await this.inventario.inputDescripcionItem.fill(descripcion);
  }

  // --- CAMPOS ADICIONALES --- //

  async irATabCamposAdicionales() {
    await this.tabCamposAdicionales.click();
  }

  /**
   * Llena campos adicionales opcionales (texto, fecha relativa, numérico).
   */
  async llenarCamposAdicionales(texto: string, numerico: string) {
    await this.inputCampoTexto.fill(texto);
    await this.inputCampoFecha.click();
    const diaValido = this.page.locator('.v-date-picker-table tbody button').first();
    await diaValido.click({ timeout: 5000 });
    await this.inputCampoNumerico.fill(numerico);
  }

  // --- GUARDAR --- //

  async crearServicio() {
    await this.botonCrearServicio.click();
    await this.inventario.esperarCarga();
  }
}
