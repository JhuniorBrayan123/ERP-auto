import { type Page, type Locator } from '@playwright/test';
import { ItemFormBasePage } from './ItemFormBasePage';
import type { ProductoListaItem } from '../../helpers/Logistica/item-data.types';

export class ListaFormPage extends ItemFormBasePage {
  constructor(page: Page) {
    super(page);
  }

  protected override get inputNombre(): Locator {
    return this.page.getByRole('textbox', { name: 'Ej. Lista de útiles primaria' });
  }

  async iniciarCreacionLista(): Promise<void> {
    await this.botonCrearItems.click();
    await this.page.getByText('LNueva lista').click();
  }

  async llenarDescripcion(descripcion: string): Promise<void> {
    const input = this.page.getByRole('textbox', { name: 'Descripción del ítem' });
    await input.click();
    await input.fill(descripcion);
  }

  async buscarYAgregarProducto(item: ProductoListaItem): Promise<void> {
    const inputBuscar = this.page.getByRole('textbox', {
      name: 'Buscar nombre del producto, c',
    });

    await inputBuscar.click();
    await inputBuscar.fill(item.codigoBusqueda);
    await this.page.getByText(item.textoSeleccion).click();

    if (item.variante) {
      await this.page.getByText(item.variante).click();
    }

    if (item.equivalencia) {
      await this.page.getByText(item.equivalencia).click();
    }

    if (item.cantidadIncrementos && item.cantidadIncrementos > 0) {
      const botonIncrementar = this.page.locator(
        '[id="lgt_reg-item_cmp-lista-productos_cmp-box_cmp-producto-agregado_v-step:cantidad_div:increase"]',
      );
      for (let i = 0; i < item.cantidadIncrementos; i++) {
        await botonIncrementar.click();
      }
    }
  }

  async crearLista(): Promise<void> {
    await this.clickBotonCrear('lista');
  }
}
