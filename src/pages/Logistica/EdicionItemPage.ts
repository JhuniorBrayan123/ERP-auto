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
                .catch(() => {
                });
        }

        const tabSelectores = this.page.getByText('Selectores', {exact: false}).first();
        await tabSelectores.waitFor({state: 'visible', timeout: 15_000});
        await tabSelectores.click();

        await this.page.waitForTimeout(1000);
        await this.page.locator('[id="cmn_cmp-overload:loading"]')
            .waitFor({state: 'hidden', timeout: 15_000})
            .catch(() => {
            });
    }

    async isSelectorCreado(): Promise<boolean> {
        return this.page.getByText('Obligatorio').isVisible().catch(() => false);
    }

    async clickAnadirSelector(): Promise<void> {
        // Click en el toggle "Añadir selector" para abrir el menú
        const toggle = this.page.locator('.cmp-option-button-toggle').filter({hasText: 'Añadir selector'});
        await toggle.waitFor({state: 'visible', timeout: 15_000});
        await toggle.click();
        await this.page.waitForTimeout(500);
    }

    async clickNuevoSelector(): Promise<void> {
        const btn = this.page.locator('[id="lgt_reg-item_v-tab:selectores-item_cmp-option-button:selectores-opciones_v-button:btn-nuevo-selector"]');
        await btn.waitFor({state: 'visible', timeout: 15_000});
        await btn.click();
        await this.page.waitForTimeout(1000);
    }

    async fillSelectorNombre(nombre: string): Promise<void> {
        const input = this.page.locator('[id="lgt_reg-item_v-tab:selectores-item_gestion-selector:formulario_v-input:nombre"]');
        await input.waitFor({state: 'visible', timeout: 15_000});
        await input.click();
        await input.fill(nombre);
    }

    async clickCrearSelectorInventario(): Promise<void> {
        const opcion = this.page.locator('[id="lgt_reg-item_cmp-card-selectores:opcion_div:inventario"]');
        await opcion.waitFor({state: 'visible', timeout: 15_000});
        await opcion.click();
    }

    async buscarYAgregarItemSelector(codigo: string): Promise<void> {
        // Input de búsqueda de items desde el modal de selector de inventario
        const inputBusqueda = this.page.locator('[id="lgt_reg-item_v-modal:busqueda-item-selector_v-input:search"]');
        await inputBusqueda.waitFor({state: 'visible', timeout: 30_000});
        await inputBusqueda.click();
        await inputBusqueda.fill(codigo);
        await this.page.waitForTimeout(1500);

        // Hacer clic en el resultado de la búsqueda (item 111111)
        const resultado = this.page.getByText(codigo, {exact: false}).first();
        await resultado.waitFor({state: 'visible', timeout: 10_000});
        await resultado.click();
        await this.page.waitForTimeout(500);

        // Cerrar/clicar fuera si hay algún panel abierto
        const btnAgregar = this.page.getByRole('button', {name: /Agregar|Seleccionar/i}).first();
        if (await btnAgregar.isVisible().catch(() => false)) {
            await btnAgregar.click();
        }
    }

    async clickCrearSelectorLibre(): Promise<void> {
        const opcion = this.page.locator('[id="lgt_reg-item_cmp-card-selectores:opcion_div:libre"]');
        await opcion.waitFor({state: 'visible', timeout: 15_000});
        await opcion.click();
    }

    async clickAnadirOpcion(): Promise<void> {
        const btn = this.page.getByRole('button', {name: 'Añadir opción'}).first();
        await btn.waitFor({state: 'visible', timeout: 15_000});
        await btn.click();
        await this.page.waitForTimeout(500);
    }

    async fillManualOptionNombre(optionIndex: number, nombre: string): Promise<void> {
        const input = this.page.locator('[id*="gestion-selector_selector-opcion"][id$=":item_v-input:nombre"]').nth(optionIndex);
        await input.waitFor({state: 'visible', timeout: 15_000});
        await input.click();
        await input.fill(nombre);
    }

    async fillManualOptionPrecio(optionIndex: number, precio: string): Promise<void> {
        const input = this.page.locator('[id*="gestion-selector_selector-opcion"][id$=":item_v-input:precio"]').nth(optionIndex);
        await input.waitFor({state: 'visible', timeout: 15_000});
        await input.click();
        await input.fill(precio);
    }

    async clickCrearSelector(): Promise<void> {
        const btn = this.page.locator('[id="lgt_reg-item_v-drape:gestion-selector_v-button:crear-selector"]');
        await btn.waitFor({state: 'visible', timeout: 15_000});
        await btn.click();
        await this.page.waitForTimeout(1500);
    }

    async waitForObligatorioSwitch(): Promise<void> {
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
