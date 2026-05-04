import { type Page } from '@playwright/test';
import { ItemFormBasePage } from './ItemFormBasePage';

export class ServicioFormPage extends ItemFormBasePage {
  constructor(page: Page) {
    super(page);
  }

  async iniciarCreacionServicio(): Promise<void> {
    await this.botonCrearItems.click();
    await this.page.getByText('SNuevo servicio').click();
  }

  async llenarPrecios(precioVenta: string, precioCompra: string): Promise<void> {
    const inputPrecioVenta = this.page.getByRole('textbox', { name: 'Monto final' }).first();
    const inputPrecioCompra = this.page.getByRole('textbox', { name: 'Monto final' }).nth(1);

    await inputPrecioVenta.click();
    await inputPrecioVenta.fill(precioVenta);
    await inputPrecioCompra.click();
    await inputPrecioCompra.fill(precioCompra);
  }

  async seleccionarTipoAfectacionIGV(opcionTexto: string): Promise<void> {
    await this.page.locator('.v-select-header-form-arrow.form.form-control').click();
    await this.page.waitForTimeout(500);
    await this.page.getByText(opcionTexto, { exact: true }).click({ force: true });
  }

  async expandirOpcionesAvanzadasServicio(): Promise<void> {
    await this.page.locator('.advance > .icon').click();
  }

  async llenarInfoAdicional(
    categoria: string,
    subcategoria: string,
    marca: string,
  ): Promise<void> {
    await this.irATabInfoAdicional();

    await this.page
      .locator(`.subcategoria > ${this.DROPDOWN_ARROW}`)
      .first()
      .click();
    await this.page.waitForTimeout(500);
    await this.page.getByText(categoria).click({ force: true });

    await this.page.waitForTimeout(500);

    await this.page
      .locator(`div:nth-child(2) > ${this.DROPDOWN_ARROW}`)
      .click({ force: true });
    await this.page.waitForTimeout(500);
    await this.page.getByText(subcategoria).click({ force: true });

    await this.page.waitForTimeout(500);

    await this.page
      .locator(`div:nth-child(3) > ${this.DROPDOWN_ARROW}`)
      .click({ force: true });
    await this.page.waitForTimeout(500);
    await this.page.getByText(marca).click({ force: true });
  }

  async crearServicio(): Promise<void> {
    await this.clickBotonCrear('servicio');
  }
}
