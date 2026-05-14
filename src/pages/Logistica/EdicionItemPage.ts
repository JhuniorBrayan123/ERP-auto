import {type Locator, type Page} from '@playwright/test';

export class EdicionItemPage {
    constructor(private readonly page: Page) {
    }

    public async waitForFormLoad(): Promise<void> {
        // Dar tiempo a que la petición a la API inicie y el spinner de carga se adjunte al DOM
        await this.page.waitForTimeout(500);

        // Esperar a que el spinner desaparezca
        await this.page.locator('[id="cmn_cmp-overload:loading"]').waitFor({
            state: 'hidden',
            timeout: 15_000
        }).catch(() => {
        });

        // Dar tiempo extra para que Vue asiente los datos de la respuesta en los v-models (evita sobreescritura de los inputs)
        await this.page.waitForTimeout(2000);
    }

    private get inputNombre(): Locator {
        return this.page.getByRole('textbox', {name: 'Ej. Gaseosa Kola R (500ml)'});
    }

    private get inputPrecioSoles(): Locator {
        return this.page.getByRole('textbox', {name: 'Monto final'}).first();
    }

    private get inputPrecioDolares(): Locator {
        return this.page.getByRole('textbox', {name: 'Monto final'}).nth(1);
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
        await dropdownMenu.waitFor({state: 'visible', timeout: 10_000});

        // Wait for the loading overlay to disappear to ensure the app processes the click
        await this.page.locator('[id="cmn_cmp-overload:loading"]').waitFor({
            state: 'hidden',
            timeout: 10_000
        }).catch(() => {
        });

        const option = dropdownMenu.getByText(optionText, {exact: true}).first();
        await option.scrollIntoViewIfNeeded();
        await option.evaluate((node) => (node as HTMLElement).click());

        // Wait for Vue's reactive state to update
        await this.page.waitForTimeout(1000);
    }

    async expandirOpcionesAvanzadas(): Promise<void> {
        // Hacemos la búsqueda un poco más flexible (ignora mayúsculas y el opcional si cambió)
        const expander = this.page.locator('div').filter({hasText: /Opciones avanzadas/i}).first();

        // Comprobamos inmediatamente si está visible, para no causar un TimeoutError de 30s
        if (await expander.isVisible()) {
            await expander.click({force: true});
        }
    }

    async goToSelectoresTab(): Promise<void> {
        await this.waitForFormLoad();
        await this.expandirOpcionesAvanzadas();
        await this.page.waitForTimeout(500);

        // Seleccionamos el TAB correcto (el <div class="v-tab">)
        const tabSelectores = this.page.locator('.v-tab', {
            hasText: 'Selectores'
        }).first();

        await tabSelectores.scrollIntoViewIfNeeded();
        await tabSelectores.click({force: true});

        // Esperar a que el TAB esté marcado como activo
        await this.page.locator('.v-tab.active, .v-tab.selected, .v-tab.v-slide-group-item--active')
            .filter({hasText: 'Selectores'})
            .waitFor({state: 'visible', timeout: 35000});

        // Esperar que se cargue el contenido del tab
        await this.page.locator('text=Obligatorio').waitFor({state: 'visible'});
    }

    async setSelectorObligatorioSwitch(): Promise<boolean> {
        // Seleccionar el checkbox directamente (escapando los :)
        const checkbox = this.page.locator('.obligatorio > div > .v-switch > .switch-content > .switch > .slider');

        await checkbox.waitFor({state: 'visible', timeout: 35000});

        const isChecked = await checkbox.isChecked();

        if (!isChecked) {
            await checkbox.locator('xpath=..').locator('.slider.round').click();
            return true;
        }

        return false;
    }

//<span data-v-5e08b722="" class="slider round"></span>
    async clickActualizarProducto(): Promise<void> {
        await this.page.getByRole('button', {name: 'Actualizar producto'}).click();
    }

    async clickClonarProducto(): Promise<void> {
        await this.page.getByRole('button', {name: 'Clonar producto'}).click();
    }

    async closeSuccessModal(): Promise<void> {
        const modal = this.page.locator('.v-modal > div').first();
        await modal.waitFor({state: 'visible', timeout: 15_000});
        await modal.click({force: true});
    }

    async clickIrAListaItems(): Promise<void> {
        const boton = this.page.getByRole('button', {name: 'Ir a lista de ítems'});
        await boton.waitFor({state: 'visible', timeout: 15_000});
        await boton.click();
    }
}
