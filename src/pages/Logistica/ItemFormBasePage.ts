import {type Locator, type Page} from '@playwright/test';

export abstract class ItemFormBasePage {

    protected readonly DROPDOWN_ARROW =
        '.form-control > .v-select > .v-select-form > .v-select-base > ' +
        '.v-select-base-header > .v-select-header-base-form > ' +
        '.v-select-header-form > .v-select-header-form-arrow';

    constructor(protected readonly page: Page) {
    }

    protected get inputNombre(): Locator {
        return this.page.getByRole('textbox', {name: 'Ej. Gaseosa Kola R (500ml)'});
    }

    protected get botonCrearItems(): Locator {
        return this.page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]');
    }

    async llenarNombre(nombre: string): Promise<void> {
        await this.inputNombre.waitFor({state: 'visible'});
        await this.inputNombre.click();
        await this.inputNombre.fill(nombre);
    }

    async expandirOpcionesAvanzadas(): Promise<void> {
        await this.page
            .locator('div')
            .filter({hasText: /^Opciones avanzadas \(opcional\)$/})
            .click();
    }

    async clickBotonCrear(tipoItem: string): Promise<void> {
        await this.page.getByRole('button', {name: `Crear ${tipoItem}`}).click();
    }

    async clickIrAListaItems(): Promise<void> {
        await this.page.getByRole('button', {name: 'Ir a lista de ítems'}).click();
    }

    async irATabInfoAdicional(): Promise<void> {
        await this.page.getByText('Información adicional(').click();
    }

    async irATabCamposAdicionales(): Promise<void> {
        await this.page.getByText('Campos adicionales(Opcional)').click();
    }

    async irATabEquivalencias(): Promise<void> {
        await this.page.getByText('Equivalencias(Opcional)').click();
    }

    async llenarCampoAdicionalTexto(texto: string): Promise<void> {
        const input = this.page.locator(
            '[id="lgt_reg-item_v-tab:campos-adicionales_grilla-campos-adicionales:campo-adicional_v-input:texto"]',
        );
        await input.click();
        await input.fill(texto);
    }

    async seleccionarCampoAdicionalFecha(buttonName: string): Promise<void> {
        const dateInput = this.page.locator(
            '[id="lgt_reg-item_v-tab:campos-adicionales_grilla-campos-adicionales:campo-adicional_v-input:fecha"]',
        );
        await dateInput.click();
        await this.page.getByRole('button', {name: buttonName}).click();
    }

    async llenarCampoAdicionalNumerico(valor: string): Promise<void> {
        const input = this.page.locator(
            '[id="lgt_reg-item_v-tab:campos-adicionales_grilla-campos-adicionales:campo-adicional_v-input:numerico"]',
        );
        await input.click();
        await input.fill(valor);
    }

    protected async seleccionarEnDropdown(
        dropdownLocator: Locator,
        opcionTexto: string,
    ): Promise<void> {
        await dropdownLocator.click();
        await this.page.getByText(opcionTexto, {exact: true}).click();
    }
}
