import { type Page } from '@playwright/test';
import { ItemFormBasePage } from './ItemFormBasePage';
import type { InsumoReceta, SelectorConfig } from '../../helpers/Logistica/item-data.types';

/**
 * Page Object para el formulario de creación de RECETAS.
 *
 * Específico de receta:
 * - Precios de venta y compra
 * - Tab de insumos/componentes: búsqueda y selección por código
 * - Gestión de selectores (manuales y con ítems del catálogo)
 * - Código de barras, código alternativo, descripción
 * - Info adicional con 2 dropdowns (subcategoría, marca)
 */
export class RecetaFormPage extends ItemFormBasePage {
  constructor(page: Page) {
    super(page);
  }

  // ─── Inicio de creación ──────────────────────────────────

  /** Abre el menú "Crear ítems" y selecciona "Nueva receta" */
  async iniciarCreacionReceta(): Promise<void> {
    await this.botonCrearItems.click();
    await this.page.getByText('RNueva receta').click();
  }

  // ─── Precios ─────────────────────────────────────────────

  /** Llena precio de venta y compra */
  async llenarPrecios(precioVenta: string, precioCompra: string): Promise<void> {
    const inputPrecioVenta = this.page.getByRole('textbox', { name: 'Monto final' }).first();
    const inputPrecioCompra = this.page.getByRole('textbox', { name: 'Monto final' }).nth(1);

    await inputPrecioVenta.click();
    await inputPrecioVenta.fill(precioVenta);
    await inputPrecioCompra.click();
    await inputPrecioCompra.fill(precioCompra);
  }

  // ─── Tab de insumos/componentes ──────────────────────────

  /** Navega al tab de insumos de la receta */
  async irATabInsumos(): Promise<void> {
    await this.page
      .locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]')
      .nth(1)
      .click();
  }

  /** Busca y agrega un insumo/producto a la receta por código */
  async buscarYAgregarInsumo(insumo: InsumoReceta): Promise<void> {
    // Esperar a que desaparezca el overlay de carga antes de interactuar
    await this.page
      .locator('[id="cmn_cmp-overload:loading"]')
      .waitFor({ state: 'hidden', timeout: 10_000 })
      .catch(() => {}); // Ignorar si no aparece

    const inputBuscar = this.page.getByRole('textbox', {
      name: 'Buscar nombre del producto, c',
    });

    await inputBuscar.click();
    await inputBuscar.fill(insumo.codigoBusqueda);
    await this.page.getByText(insumo.textoSeleccion).first().click();

    // Seleccionar variante si aplica (abre un overlay con opciones)
    if (insumo.variante) {
      await this.page.getByText(insumo.variante).first().click();
    }

    // Seleccionar equivalencia si aplica
    // Usamos .first() porque el texto puede aparecer tanto en el overlay
    // de selección como en la lista de productos ya agregados
    if (insumo.equivalencia) {
      await this.page.getByText(insumo.equivalencia).first().click();
    }
  }

  // ─── Selectores ──────────────────────────────────────────

  /** Navega al tab de selectores */
  async irATabSelectores(): Promise<void> {
    await this.page
      .locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-5"]')
      .nth(4)
      .click();
  }

  /** Clickea "Añadir selector" para expandir la sección */
  async clickAnadirSelector(): Promise<void> {
    await this.page.locator('div').filter({ hasText: /^Añadir selector$/ }).first().click();
  }

  /** Crea un selector con opciones manuales y/o ítems del catálogo */
  async crearSelector(config: SelectorConfig): Promise<void> {
    await this.clickAnadirSelector();
    await this.page.getByRole('button', { name: 'Nuevo selector' }).click();

    // Título del selector
    const inputTitulo = this.page.getByRole('textbox', {
      name: 'Digita el título del selector',
    });
    await inputTitulo.click();
    await inputTitulo.fill(config.titulo);

    // Opciones manuales (tipo libre)
    if (config.opcionesManuales && config.opcionesManuales.length > 0) {
      await this.page
        .locator('[id="lgt_reg-item_cmp-card-selectores:opcion_div:libre"]')
        .click();

      for (let i = 0; i < config.opcionesManuales.length; i++) {
        const opcion = config.opcionesManuales[i];

        if (i > 0) {
          await this.page.getByRole('button', { name: 'Añadir opción' }).click();
        }

        const inputNombre = this.page
          .locator(
            '[id="lgt_reg-item_v-drape:gestion-selector_selector-opcion:item_v-input:nombre"]',
          )
          .nth(i);
        const inputPrecio = this.page
          .locator(
            '[id="lgt_reg-item_v-drape:gestion-selector_selector-opcion:item_v-input:precio"]',
          )
          .nth(i);

        await inputNombre.click();
        await inputNombre.fill(opcion.nombre);
        await inputPrecio.click();
        await inputPrecio.fill(opcion.precio);
      }
    }

    // Items del catálogo
    if (config.itemBusqueda) {
      await this.page.getByText('Crear selectores con ítems de').click();
      const inputBuscar = this.page.getByRole('textbox', {
        name: 'Buscar nombre del producto o',
      });
      await inputBuscar.click();
      await inputBuscar.fill(config.itemBusqueda.codigo);
      await this.page.getByText(config.itemBusqueda.textoSeleccion).click();
      await this.page.locator('.v-modal > div').first().click();

      // Precio del item del catálogo (siguiente al de las opciones manuales)
      const numOpcionesPrevias = config.opcionesManuales?.length ?? 0;
      const inputPrecioCatalogo = this.page
        .locator(
          '[id="lgt_reg-item_v-drape:gestion-selector_selector-opcion:item_v-input:precio"]',
        )
        .nth(numOpcionesPrevias);
      await inputPrecioCatalogo.click();
      await inputPrecioCatalogo.fill(config.itemBusqueda.precio);
    }

    await this.page.getByRole('button', { name: 'Crear selector' }).click();
  }

  /** Marca un selector como obligatorio */
  async marcarSelectorObligatorio(): Promise<void> {
    await this.page.locator('.obligatorio > div').click();
  }

  // ─── Campos de identificación adicional ──────────────────

  /** Llena el campo de código de barras */
  async llenarCodigoBarras(codigo: string): Promise<void> {
    const input = this.page.getByRole('textbox', {
      name: 'Escanea o digita el código de',
    });
    await input.click();
    await input.fill(codigo);
  }

  /** Llena el campo de código alternativo */
  async llenarCodigoAlternativo(codigo: string): Promise<void> {
    const input = this.page.getByRole('textbox', {
      name: 'Ingresa código alternativo',
    });
    await input.click();
    await input.fill(codigo);
  }

  /** Llena el campo de descripción del ítem */
  async llenarDescripcion(descripcion: string): Promise<void> {
    const input = this.page.getByRole('textbox', { name: 'Descripción del ítem' });
    await input.click();
    await input.fill(descripcion);
  }

  // ─── Información adicional (2 dropdowns) ─────────────────

  /**
   * Llena info adicional para recetas.
   * Receta tiene SOLO 2 dropdowns: subcategoría y marca.
   */
  async llenarInfoAdicional(subcategoria: string, marca: string): Promise<void> {
    await this.page
      .locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]')
      .nth(2)
      .click();

    // Subcategoría
    await this.page
      .locator(`.subcategoria > ${this.DROPDOWN_ARROW}`)
      .first()
      .click();
    await this.page.getByText(subcategoria).click();

    // Marca
    await this.page
      .locator(`div:nth-child(2) > ${this.DROPDOWN_ARROW}`)
      .click();
    await this.page.getByText(marca).click();
  }

  /**
   * Llena info adicional para recetas usando patron alternativo con "Ninguna".
   * Usado cuando la receta tiene opciones avanzadas ya abiertas y navegadas.
   */
  async llenarInfoAdicionalAlternativo(subcategoria: string, marca: string): Promise<void> {
    await this.irATabInfoAdicional();

    await this.page
      .locator('div')
      .filter({ hasText: /^Ninguna$/ })
      .nth(3)
      .click();
    await this.page.getByText(subcategoria).click();

    await this.page
      .locator('div')
      .filter({ hasText: /^Ninguna$/ })
      .nth(3)
      .click();
    await this.page.getByText(marca).click();
  }

  // ─── Creación ────────────────────────────────────────────

  /** Clickea "Crear receta" */
  async crearReceta(): Promise<void> {
    await this.clickBotonCrear('receta');
  }
}
