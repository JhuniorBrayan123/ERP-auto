import {type Locator, type Page} from '@playwright/test';

export class EdicionItemPage {
    constructor(private readonly page: Page) {
    }

    public async waitForFormLoad(): Promise<void> {
        
        await this.page.waitForTimeout(500);

        await this.page.locator('[id="cmn_cmp-overload:loading"]').waitFor({
            state: 'hidden',
            timeout: 15_000
        }).catch(() => {
        });

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

        const dropdownMenu = this.page.locator('.v-select-base-options.is-open');
        await dropdownMenu.waitFor({state: 'visible', timeout: 10_000});

        await this.page.locator('[id="cmn_cmp-overload:loading"]').waitFor({
            state: 'hidden',
            timeout: 10_000
        }).catch(() => {
        });

        const option = dropdownMenu.getByText(optionText, {exact: true}).first();
        await option.scrollIntoViewIfNeeded();
        await option.evaluate((node) => (node as HTMLElement).click());

        await this.page.waitForTimeout(1000);
    }

    async expandirOpcionesAvanzadas(): Promise<void> {
        
        const expander = this.page.locator('div').filter({hasText: /Opciones avanzadas/i}).first();

        if (await expander.isVisible()) {
            await expander.click({force: true});
        }
    }

    async goToSelectoresTab(): Promise<void> {
        await this.waitForFormLoad();

        const tabOpcionesAvanzadas = this.page.getByText('Opciones avanzadas (opcional)', {exact: false});
        if (await tabOpcionesAvanzadas.isVisible()) {
            await tabOpcionesAvanzadas.click();
            
            await this.page.waitForTimeout(1000);
            await this.page.locator('[id="cmn_cmp-overload:loading"]')
                .waitFor({state: 'hidden', timeout: 10_000})
                .catch(() => {});
        }

        const tabSelectores = this.page.getByText('Selectores', {exact: false}).first();
        await tabSelectores.waitFor({state: 'visible', timeout: 15_000});
        await tabSelectores.click();

        await this.page.locator('text=Obligatorio').waitFor({state: 'visible', timeout: 15_000});
    }

    async setSelectorObligatorioSwitch(): Promise<boolean> {
        
        const checkbox = this.page.locator('.obligatorio > div > .v-switch > .switch-content > .switch > .slider');

        await checkbox.waitFor({state: 'visible', timeout: 35000});

        const isChecked = await checkbox.isChecked();

        if (!isChecked) {
            await checkbox.locator('xpath=..').locator('.slider.round').click();
            return true;
        }

        return false;
    }

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
