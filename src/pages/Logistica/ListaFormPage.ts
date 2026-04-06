import { type Page, type Locator } from '@playwright/test';
import { ItemFormBasePage } from './ItemFormBasePage';
import type { ProductoListaItem } from '../../helpers/Logistica/item-data.types';

/**
 * Page Object para el formulario de creación de LISTAS.
 *
 * Específico de lista:
 * - Campo de nombre con placeholder DIFERENTE ("Ej. Lista de útiles primaria")
 * - Campo de descripción
 * - Búsqueda y agregación de productos (sin precios propios)
 * - Control de cantidad de cada producto
 * - NO tiene precios propios
 * - NO tiene stock
 * - NO tiene opciones avanzadas
 */
export class ListaFormPage extends ItemFormBasePage {
  constructor(page: Page) {
    super(page);
  }

  // ─── Override del input de nombre ────────────────────────

  /** El placeholder de nombre de lista es diferente al de otros tipos */
  protected override get inputNombre(): Locator {
    return this.page.getByRole('textbox', { name: 'Ej. Lista de útiles primaria' });
  }

  // ─── Inicio de creación ──────────────────────────────────

  /** Abre el menú "Crear ítems" y selecciona "Nueva lista" */
  async iniciarCreacionLista(): Promise<void> {
    await this.botonCrearItems.click();
    await this.page.getByText('LNueva lista').click();
  }

  // ─── Descripción ─────────────────────────────────────────

  /** Llena el campo de descripción del ítem */
  async llenarDescripcion(descripcion: string): Promise<void> {
    const input = this.page.getByRole('textbox', { name: 'Descripción del ítem' });
    await input.click();
    await input.fill(descripcion);
  }

  // ─── Productos de la lista ───────────────────────────────

  /** Busca y agrega un producto a la lista por código */
  async buscarYAgregarProducto(item: ProductoListaItem): Promise<void> {
    const inputBuscar = this.page.getByRole('textbox', {
      name: 'Buscar nombre del producto, c',
    });

    await inputBuscar.click();
    await inputBuscar.fill(item.codigoBusqueda);
    await this.page.getByText(item.textoSeleccion).click();

    // Seleccionar variante si aplica
    if (item.variante) {
      await this.page.getByText(item.variante).click();
    }

    // Seleccionar equivalencia si aplica
    if (item.equivalencia) {
      await this.page.getByText(item.equivalencia).click();
    }

    // Incrementar cantidad si se especifica
    if (item.cantidadIncrementos && item.cantidadIncrementos > 0) {
      const botonIncrementar = this.page.locator(
        '[id="lgt_reg-item_cmp-lista-productos_cmp-box_cmp-producto-agregado_v-step:cantidad_div:increase"]',
      );
      for (let i = 0; i < item.cantidadIncrementos; i++) {
        await botonIncrementar.click();
      }
    }
  }

  // ─── Creación ────────────────────────────────────────────

  /** Clickea "Crear lista" */
  async crearLista(): Promise<void> {
    await this.clickBotonCrear('lista');
  }
}
