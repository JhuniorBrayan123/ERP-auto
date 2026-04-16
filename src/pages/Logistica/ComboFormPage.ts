import { type Page } from '@playwright/test';
import { ItemFormBasePage } from './ItemFormBasePage';
import type { ComponenteCombo } from '../../helpers/Logistica/item-data.types';

/**
 * Page Object para el formulario de creación de COMBOS.
 *
 * Específico de combo:
 * - Precios de venta y compra
 * - Tab de componentes: búsqueda y selección de productos existentes por código
 * - Selección de variantes y equivalencias de componentes
 * - Info adicional con 2 dropdowns (subcategoría, marca) — NO tiene categoría
 */
export class ComboFormPage extends ItemFormBasePage {
  constructor(page: Page) {
    super(page);
  }

  // ─── Inicio de creación ──────────────────────────────────

  /** Abre el menú "Crear ítems" y selecciona "Nuevo combo" */
  async iniciarCreacionCombo(): Promise<void> {
    await this.botonCrearItems.click();
    await this.page.getByText('CNuevo combo').click();
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

  // ─── Tab de componentes ──────────────────────────────────

  /** Navega al tab de componentes del combo */
  async irATabComponentes(): Promise<void> {
    await this.page
      .locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]')
      .nth(1)
      .click();
  }

  /** Busca y agrega un componente al combo por código */
  async buscarYAgregarComponente(componente: ComponenteCombo): Promise<void> {
    // Esperar a que desaparezca el overlay de carga antes de interactuar
    await this.page
      .locator('[id="cmn_cmp-overload:loading"]')
      .waitFor({ state: 'hidden', timeout: 10_000 })
      .catch(() => {}); // Ignorar si no aparece

    const inputBuscar = this.page.getByRole('textbox', {
      name: 'Buscar nombre del producto, c',
    });

    await inputBuscar.click();
    await inputBuscar.fill(componente.codigoBusqueda);
    await this.page.getByText(componente.textoSeleccion).first().click();

    // Seleccionar variante si aplica
    if (componente.variante) {
      await this.page.getByText(componente.variante).first().click();
    }

    // Seleccionar equivalencia si aplica
    if (componente.equivalencia) {
      await this.page.getByText(componente.equivalencia).first().click();
    }
  }

  // ─── Información adicional (2 dropdowns) ─────────────────

  /**
   * Llena info adicional para combos.
   * Combo tiene SOLO 2 dropdowns: subcategoría y marca (NO tiene categoría).
   */
  async llenarInfoAdicional(subcategoria: string, marca: string): Promise<void> {
    // Navegar al tab de info adicional dentro de opciones avanzadas
    await this.page
      .locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]')
      .nth(2)
      .click();

    // Subcategoría — primer dropdown en sección .subcategoria
    await this.page
      .locator(`.subcategoria > ${this.DROPDOWN_ARROW}`)
      .first()
      .click();
    await this.page.getByText(subcategoria).click();

    // Marca — segundo dropdown
    await this.page
      .locator(`div:nth-child(2) > ${this.DROPDOWN_ARROW}`)
      .click();
    await this.page.getByText(marca).click();
  }

  // ─── Creación ────────────────────────────────────────────

  /** Clickea "Crear combo" */
  async crearCombo(): Promise<void> {
    await this.clickBotonCrear('combo');
  }
}
