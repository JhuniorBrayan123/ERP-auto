import { Page, Locator } from '@playwright/test';
import { InventarioPage } from './InventarioPage';

/**
 * Page Object para creación de Recetas y Listas.
 * Se combinan en un POM porque comparten el patrón de búsqueda de ítems,
 * pero mantienen métodos separados por sus diferencias funcionales.
 */
export class RecetaListaPage {
  readonly page: Page;
  readonly inventario: InventarioPage;

  // Formulario de Receta
  readonly inputNombreReceta: Locator;
  readonly inputMontoSolesReceta: Locator;
  readonly inputMontoDolaresReceta: Locator;
  readonly botonCrearReceta: Locator;
  readonly tabAnadirItemsReceta: Locator;
  readonly tabInfoAdicionalReceta: Locator;

  // Formulario de Lista
  readonly inputNombreLista: Locator;
  readonly botonCrearLista: Locator;

  // Búsqueda compartida
  readonly inputBuscarItem: Locator;

  constructor(page: Page, inventario: InventarioPage) {
    this.page = page;
    this.inventario = inventario;

    // Receta
    this.inputNombreReceta = page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' });
    this.inputMontoSolesReceta = page.getByRole('textbox', { name: 'Monto final' }).first();
    this.inputMontoDolaresReceta = page.getByRole('textbox', { name: 'Monto final' }).nth(1);
    this.botonCrearReceta = page.getByRole('button', { name: 'Crear receta' });
    this.tabAnadirItemsReceta = page.locator(
      '[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]'
    ).nth(1);
    this.tabInfoAdicionalReceta = page.locator(
      '[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]'
    ).nth(2);

    // Lista
    this.inputNombreLista = page.getByRole('textbox', { name: 'Ej. Lista de útiles primaria' });
    this.botonCrearLista = page.getByRole('button', { name: 'Crear lista' });

    // Búsqueda
    this.inputBuscarItem = page.getByRole('textbox', { name: 'Buscar nombre del producto, c' });
  }

  // ================================================
  //                MÉTODOS DE RECETA
  // ================================================

  async llenarNombreYPreciosReceta(nombre: string, montoSoles: string, montoDolares: string) {
    await this.inputNombreReceta.fill(nombre);
    await this.inputMontoSolesReceta.fill(montoSoles);
    await this.inputMontoDolaresReceta.fill(montoDolares);
  }

  async irATabAnadirItemsReceta() {
    await this.tabAnadirItemsReceta.click();
  }

  async irATabInfoAdicionalReceta() {
    await this.tabInfoAdicionalReceta.click();
  }

  // --- BÚSQUEDA DE ÍTEMS (compartida entre receta y lista) --- //

  /**
   * Busca un ítem por código y lo selecciona.
   */
  async buscarYAgregarItem(codigoBusqueda: string, textoResultado: string) {
    await this.inputBuscarItem.click();
    await this.inputBuscarItem.fill(codigoBusqueda);
    await this.page.getByText(textoResultado).click();
  }

  /**
   * Busca ítem con equivalencia y selecciona la variante de equivalencia.
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
   * Busca ítem con variante y selecciona variantes del modal.
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
   * Busca ítem usando filtro de div (para resultados con texto exacto en div).
   */
  async buscarYAgregarItemPorDiv(codigoBusqueda: string, textoExacto: RegExp) {
    await this.inputBuscarItem.click();
    await this.inputBuscarItem.fill(codigoBusqueda);
    await this.page.locator('div').filter({ hasText: textoExacto }).nth(2).click();
  }

  /**
   * Limpia el campo de búsqueda para nueva búsqueda.
   */
  async limpiarBusqueda() {
    await this.inputBuscarItem.click();
    await this.inputBuscarItem.fill('');
  }

  // --- CATEGORIZACIÓN DE RECETA --- //

  async configurarCategorizacionReceta() {
    await this.page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
    await this.page.locator('div').filter({ hasText: /^AUTO-TEST$/ }).nth(2).click();

    await this.page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
    await this.page.locator('div').filter({ hasText: /^AUTOMATIZADO$/ }).nth(2).click();
  }

  /**
   * Categorización alternativa usando primer match de AUTO-TEST.
   */
  async configurarCategorizacionRecetaAlt() {
    await this.page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
    await this.page.locator('div').filter({ hasText: /^AUTO-TEST$/ }).first().click();

    await this.page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
    await this.page.locator('div').filter({ hasText: /^AUTOMATIZADO$/ }).nth(2).click();
  }

  async llenarDescripcionReceta(descripcion: string) {
    await this.inventario.inputDescripcionItem.fill(descripcion);
  }

  async crearReceta() {
    await this.botonCrearReceta.click();
    await this.inventario.esperarCarga();
  }

  /**
   * Corrige el nombre de la receta (cuando falla la primera creación por nombre duplicado).
   */
  async corregirNombreYRecrear(nuevoNombre: string) {
    await this.page.getByText('Información básica').click();
    await this.inputNombreReceta.fill(nuevoNombre);
    await this.botonCrearReceta.click();
    await this.inventario.esperarCarga();
  }

  // ================================================
  //                MÉTODOS DE LISTA
  // ================================================

  async llenarNombreLista(nombre: string) {
    await this.inputNombreLista.fill(nombre);
  }

  /**
   * Espera a que cargue el formulario de lista (overlay específico).
   */
  async esperarCargaFormularioLista() {
    await this.inventario.esperarCarga();
  }

  /**
   * Busca y agrega un ítem a la lista. Las listas muestran precios en la búsqueda.
   */
  async buscarYAgregarItemLista(codigoBusqueda: string, textoResultado: string) {
    await this.inputBuscarItem.click();
    await this.inputBuscarItem.fill(codigoBusqueda);
    await this.page.getByText(textoResultado).click();
  }

  /**
   * Busca ítem con equivalencia para lista y selecciona equivalencia.
   */
  async buscarYAgregarItemEquivalenteLista(
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
   * Busca ítem con variante para lista y selecciona variante del modal.
   */
  async buscarYAgregarItemVarianteLista(
    codigoBusqueda: string,
    textoProducto: string,
    textoVariante: string
  ) {
    await this.inputBuscarItem.click();
    await this.inputBuscarItem.fill(codigoBusqueda);
    await this.page.getByText(textoProducto).click();
    await this.page.getByText(textoVariante).click();
  }

  /**
   * Busca ítem selector para lista usando locator por div.
   */
  async buscarYAgregarItemSelectorLista(codigoBusqueda: string, textoExacto: RegExp) {
    await this.inputBuscarItem.click();
    await this.inputBuscarItem.fill(codigoBusqueda);
    await this.page.locator('div').filter({ hasText: textoExacto }).nth(4).click();
  }

  async crearLista() {
    await this.botonCrearLista.click();
    await this.inventario.esperarCarga();
  }
}
