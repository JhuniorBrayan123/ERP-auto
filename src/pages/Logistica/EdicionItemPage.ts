import { type Page, type Locator } from '@playwright/test';

export class EdicionItemPage {
  constructor(private readonly page: Page) {}

  private get inputNombre(): Locator {
    return this.page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' });
  }

  private get inputPrecioSoles(): Locator {
    return this.page.getByRole('textbox', { name: 'Monto final' }).first();
  }

  private get inputPrecioDolares(): Locator {
    return this.page.getByRole('textbox', { name: 'Monto final' }).nth(1);
  }

  async updateName(newName: string): Promise<void> {
    await this.inputNombre.click();
    await this.inputNombre.clear();
    await this.inputNombre.fill(newName);
  }

  async updatePrecioSoles(precio: string): Promise<void> {
    await this.inputPrecioSoles.click();
    await this.inputPrecioSoles.clear();
    await this.inputPrecioSoles.fill(precio);
  }

  async updatePrecioDolares(precio: string): Promise<void> {
    await this.inputPrecioDolares.click();
    await this.inputPrecioDolares.clear();
    await this.inputPrecioDolares.fill(precio);
  }

  async updatePrices(precioSoles: string, precioDolares: string): Promise<void> {
    await this.updatePrecioSoles(precioSoles);
    await this.updatePrecioDolares(precioDolares);
  }

  async selectAffectationType(optionText: string): Promise<void> {
    await this.page
      .locator('.v-select-header-form-arrow.form.form-control')
      .click();

    const option = this.page
      .locator('.v-select-form-option')
      .getByText(optionText, { exact: true });

    await option.scrollIntoViewIfNeeded();

    await option.click();
  }

  async clickActualizarProducto(): Promise<void> {
    await this.page.getByRole('button', { name: 'Actualizar producto' }).click();
  }

  async clickClonarProducto(): Promise<void> {
    await this.page.getByRole('button', { name: 'Clonar producto' }).click();
  }

  async closeSuccessModal(): Promise<void> {
    await this.page.locator('.v-modal > div').first().click();
  }

  async clickIrAListaItems(): Promise<void> {
    await this.page.getByRole('button', { name: 'Ir a lista de ítems' }).click();
  }
}
