import { type Page, type Locator } from '@playwright/test';
import { ItemFormBasePage } from './ItemFormBasePage';

export class InsumoFormPage extends ItemFormBasePage {
  constructor(page: Page) {
    super(page);
  }

  /** Locator compartido para los tabs del formulario de insumo */
  private get tabs(): Locator {
    return this.page.locator(
      '[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]',
    );
  }

  async iniciarCreacionInsumo(): Promise<void> {
    await this.botonCrearItems.click();
    await this.page.getByText('INuevo insumo').click();
    // Esperar a que el formulario se renderice
    await this.inputNombre.waitFor({ state: 'visible' });
  }

  override async expandirOpcionesAvanzadas(): Promise<void> {
    await this.page.getByText('Opciones avanzadas (opcional)').click();
    // Esperar a que los sub-tabs se rendericen
    await this.tabs.first().waitFor({ state: 'visible' });
  }

  async seleccionarUnidadMedida(unidad: string): Promise<void> {
    await this.page.locator('.v-select-header-form-arrow').first().click();
    await this.page.getByText(unidad).click();
    await this.page.waitForTimeout(300);
  }

  async llenarCodigoBarras(codigo: string): Promise<void> {
    const input = this.page.getByRole('textbox', {
      name: 'Escanea o digita el código de',
    });
    await input.click();
    await input.fill(codigo);
  }

  async irATabStock(): Promise<void> {
    // nth(1) = segundo tab = Stock (Opcional)
    await this.tabs.nth(1).click();
    await this.page.waitForTimeout(500);
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
    // nth(2) = tercer tab = Información adicional (Opcional)
    await this.tabs.nth(2).click();
    // Esperar a que el contenido del tab se renderice completamente
    await this.page.locator(`.subcategoria`).first().waitFor({ state: 'visible', timeout: 10_000 });
    await this.page.waitForTimeout(500);

    // 1er dropdown en UI = Marca (selector .subcategoria)
    await this.page
      .locator(`.subcategoria > ${this.DROPDOWN_ARROW}`)
      .first()
      .click();
    await this.page.waitForTimeout(300);
    await this.page.locator('div').filter({ hasText: new RegExp(`^${marca}$`) }).click();
    await this.page.waitForTimeout(500);

    // 2do dropdown en UI = Categoría (nth-child(2))
    await this.page
      .locator(`div:nth-child(2) > ${this.DROPDOWN_ARROW}`)
      .click();
    await this.page.waitForTimeout(300);
    await this.page.getByText(categoria).click();
    await this.page.waitForTimeout(500);

    // 3er dropdown en UI = Subcategoría (nth-child(3))
    await this.page
      .locator(`div:nth-child(3) > ${this.DROPDOWN_ARROW}`)
      .click();
    await this.page.waitForTimeout(300);
    await this.page.getByText(subcategoria).click();
    await this.page.waitForTimeout(300);
  }

  async crearInsumo(): Promise<void> {
    await this.clickBotonCrear('insumo');
  }
}
