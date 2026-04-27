import { type Page, type Locator } from '@playwright/test';

export class EdicionItemPage {
  constructor(private readonly page: Page) {}

  /**
   * Espera a que el modal de edición termine de cargar los datos del item desde la API.
   * Esto previene race conditions donde Playwright llena los inputs y luego la API los sobreescribe.
   */
  private async waitForFormLoad(): Promise<void> {
    // Dar tiempo a que la petición a la API inicie y el spinner de carga se adjunte al DOM
    await this.page.waitForTimeout(500);
    
    // Esperar a que el spinner desaparezca
    await this.page.locator('[id="cmn_cmp-overload:loading"]').waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
    
    // Dar tiempo extra para que Vue asiente los datos de la respuesta en los v-models (evita sobreescritura de los inputs)
    await this.page.waitForTimeout(2000); 
  }

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
    await this.waitForFormLoad();
    await this.inputNombre.click();
    await this.inputNombre.clear();
    await this.inputNombre.fill(newName);
  }

  async updatePrecioSoles(precio: string): Promise<void> {
    await this.waitForFormLoad();
    await this.inputPrecioSoles.click();
    await this.inputPrecioSoles.clear();
    await this.inputPrecioSoles.fill(precio);
  }

  async updatePrecioDolares(precio: string): Promise<void> {
    await this.waitForFormLoad();
    await this.inputPrecioDolares.click();
    await this.inputPrecioDolares.clear();
    await this.inputPrecioDolares.fill(precio);
  }

  async updatePrices(precioSoles: string, precioDolares: string): Promise<void> {
    await this.updatePrecioSoles(precioSoles);
    await this.updatePrecioDolares(precioDolares);
  }

  async selectAffectationType(optionText: string): Promise<void> {
    await this.waitForFormLoad();

    await this.page
      .locator('.v-select-header-form-arrow.form.form-control')
      .click();

    // Wait for the dropdown options to be visible in the DOM
    const dropdownMenu = this.page.locator('.v-select-base-options.is-open');
    await dropdownMenu.waitFor({ state: 'visible', timeout: 10_000 });

    // Wait for the loading overlay to disappear to ensure the app processes the click
    await this.page.locator('[id="cmn_cmp-overload:loading"]').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});

    const option = dropdownMenu.getByText(optionText, { exact: true }).first();
    await option.scrollIntoViewIfNeeded();
    await option.evaluate((node) => (node as HTMLElement).click());

    // Wait for Vue's reactive state to update
    await this.page.waitForTimeout(1000);
  }

  async clickActualizarProducto(): Promise<void> {
    await this.page.getByRole('button', { name: 'Actualizar producto' }).click();
  }

  async clickClonarProducto(): Promise<void> {
    await this.page.getByRole('button', { name: 'Clonar producto' }).click();
  }

  async closeSuccessModal(): Promise<void> {
    const modal = this.page.locator('.v-modal > div').first();
    await modal.waitFor({ state: 'visible', timeout: 15_000 });
    await modal.click({ force: true });
  }

  async clickIrAListaItems(): Promise<void> {
    const boton = this.page.getByRole('button', { name: 'Ir a lista de ítems' });
    await boton.waitFor({ state: 'visible', timeout: 15_000 });
    await boton.click();
  }
}
