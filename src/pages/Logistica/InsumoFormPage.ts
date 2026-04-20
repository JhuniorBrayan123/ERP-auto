import { type Page, type Locator } from '@playwright/test';
import { ItemFormBasePage } from './ItemFormBasePage';

export class InsumoFormPage extends ItemFormBasePage {
  constructor(page: Page) {
    super(page);
  }

  async iniciarCreacionInsumo(): Promise<void> {
    await this.botonCrearItems.click();
    await this.page.getByText('INuevo insumo').click();
  }

  async seleccionarUnidadMedida(unidad: string): Promise<void> {
    await this.page.locator('.v-select-header-form-arrow').first().click();
    await this.page.getByText(unidad).click();
  }

  async llenarCodigoBarras(codigo: string): Promise<void> {
    const input = this.page.getByRole('textbox', {
      name: 'Escanea o digita el código de',
    });
    await input.click();
    await input.fill(codigo);
  }

  async irATabStock(): Promise<void> {
    await this.page.getByText('Stock(Opcional)').click();
  }

  async seleccionarControlEstricto(): Promise<void> {
    await this.page
      .locator('[id="lgt_reg-item_v-tab:stock-almacen_cmp-card-stock:control-estricto"]')
      .click();
  }

  async llenarCantidadesStock(cantidadMaxima: string, cantidadMinima: string): Promise<void> {
    const inputMax = this.page
      .locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]')
      .first();
    const inputMin = this.page
      .locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]')
      .nth(1);

    await inputMax.click();
    await inputMax.fill(cantidadMaxima);
    await inputMin.click();
    await inputMin.fill(cantidadMinima);
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
    await this.page.getByText(categoria).click();

    await this.page
      .locator(`div:nth-child(2) > ${this.DROPDOWN_ARROW}`)
      .first()
      .click();
    await this.page.getByText(subcategoria).click();

    await this.page
      .locator(`div:nth-child(3) > ${this.DROPDOWN_ARROW}`)
      .click();
    await this.page.getByText(marca).click();
  }

  async crearInsumo(): Promise<void> {
    await this.clickBotonCrear('insumo');
  }
}
