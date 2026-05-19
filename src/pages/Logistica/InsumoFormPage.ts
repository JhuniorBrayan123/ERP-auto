import { type Locator, type Page } from '@playwright/test';
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
        const panel = this.page.locator('div').filter({
            hasText: /^Opciones avanzadas \(opcional\)$/
        });

        // Verificar si ya está expandido antes de hacer click
        const contenido = this.page.locator('[data-panel-expanded], .opciones-avanzadas-content');
        const yaExpandido = await contenido.isVisible().catch(() => false);

        if (!yaExpandido) {
            await panel.click();
            // Esperar a que el acordeón termine de animarse
            await this.page.waitForTimeout(600);
        }

        // Esperar explícitamente que el tab de Info Adicional sea visible y clickeable
        await this.page
            .getByText('Información adicional')
            .waitFor({ state: 'visible', timeout: 5000 });
    }

    async seleccionarUnidadMedida(unidad: string): Promise<void> {
        const dropdown = this.page
            .locator('.codigo-unidad > .unidad .v-select-header-form-arrow');

        await dropdown.waitFor({ state: 'visible', timeout: 5000 });
        await dropdown.click();

        await this.page
            .locator('.v-select-form-option')
            .first()
            .waitFor({ state: 'visible', timeout: 5000 });

        await this.page.waitForTimeout(500);
        await this.page.getByText(unidad, { exact: true }).click({ force: true });
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
        marca: string,
        categoria: string,
        subcategoria: string,
    ): Promise<void> {
        const tabInfoAdicional = this.page.getByText('Información adicional');

        if (await tabInfoAdicional.isVisible()) {
            await tabInfoAdicional.click();
            await this.page.waitForTimeout(300);
        }

        // --- Helpers locales: lógica especial que NO debe contaminar la clase base ---
        // InsumoFormPage tiene dropdowns dependientes (categoría → subcategoría) que
        // requieren esperas entre selecciones y clicks vía evaluate() para evitar
        // intercepción de puntero por el overlay de carga.

        const dropdownArrows = this.page.locator('.subcategoria').locator(this.DROPDOWN_ARROW);

        // Marca (dropdown independiente)
        await dropdownArrows.nth(0).click();
        await this.page.waitForTimeout(300);
        const marcaOption = this.page.getByText(marca, { exact: true }).first();
        await marcaOption.scrollIntoViewIfNeeded();
        await marcaOption.evaluate((node) => (node as HTMLElement).click());

        await this.page.waitForTimeout(300);

        // Categoría (al seleccionar, dispara carga async de subcategorías)
        await dropdownArrows.nth(1).click();
        await this.page.waitForTimeout(300);
        const catOption = this.page.getByText(categoria, { exact: true }).first();
        await catOption.scrollIntoViewIfNeeded();
        await catOption.evaluate((node) => (node as HTMLElement).click());

        // Esperar a que las opciones de Subcategoría se carguen tras seleccionar Categoría
        await this.page.waitForTimeout(500);

        // Subcategoría (depende de la categoría seleccionada)
        await dropdownArrows.nth(2).click();
        await this.page.waitForTimeout(300);
        const subOption = this.page.getByText(subcategoria, { exact: true }).first();
        await subOption.scrollIntoViewIfNeeded();
        await subOption.evaluate((node) => (node as HTMLElement).click());
    }

    async crearInsumo(): Promise<void> {
        await this.clickBotonCrear('insumo');
    }
}
