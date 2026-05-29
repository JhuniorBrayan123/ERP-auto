import { type Page, type Locator, expect } from "@playwright/test";
import { ItemFormBasePage } from "./ItemFormBasePage";
import type { ProductoListaItem } from "../../helpers/Logistica/item-data.types";

export class ListaFormPage extends ItemFormBasePage {
  constructor(page: Page) {
    super(page);
  }

  protected override get inputNombre(): Locator {
    return this.page.getByRole("textbox", {
      name: "Ej. Lista de útiles primaria",
    });
  }
  
  async obtenerValorNombre(): Promise<string> {
    return await this.inputNombre.inputValue();
  }

  async iniciarCreacionLista(): Promise<void> {
    await this.botonCrearItems.click();
    await this.page.getByText("LNueva lista").click();
    
    await this.inputNombre.waitFor({ state: "visible" });
    await this.page.waitForTimeout(2000);
  }

  override async llenarNombre(nombre: string): Promise<void> {
    
    await this.inputNombre.focus();
    await this.inputNombre.fill("");

    await this.page.waitForTimeout(300);

    await this.inputNombre.pressSequentially(nombre, { delay: 50 });
    await expect(this.inputNombre).toHaveValue(nombre);
  }

  async llenarCodigo(codigo: number): Promise<void> {
    await this.page.getByText("Automático").first().click();
    await this.page.getByText("Manual").first().click();
    await this.page
      .locator('[id="lgt_reg-item_cmp-lista-productos:informacion-basica_v-input:codigo"]')
      .fill(codigo.toString());
  }

  async llenarDescripcion(descripcion: string): Promise<void> {
    const input = this.page.getByRole("textbox", {
      name: "Descripción del ítem",
    });
    await input.click();
    await input.fill(descripcion);
  }

  async buscarYAgregarProducto(item: ProductoListaItem): Promise<void> {
    const inputBuscar = this.page.getByRole("textbox", {
      name: "Buscar nombre del producto, c",
    });

    await inputBuscar.click();
    await inputBuscar.fill(item.codigoBusqueda);
    await this.page.getByText(item.textoSeleccion, {exact: true}).click();

    if (item.variante) {
      await this.page.getByText(item.variante, {exact: true}).click();
    }

    if (item.equivalencia) {
      await this.page.getByText(item.equivalencia, {exact: true}).click();
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
    await this.clickBotonCrear("lista");
  }
}
