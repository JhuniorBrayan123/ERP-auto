import { type Locator, type Page } from '@playwright/test';
import { esperarCargaOverlaySiVisible } from '@utils/wait-helpers';

export class CotizacionOpcionesPage {
    constructor(private readonly page: Page) {}

    private get inputIncluirImagenes(): Locator {
        return this.page.locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-switch:impresion-imagen"]'
        );
    }
    private get toggleIncluirImagenes(): Locator {
        return this.page
            .locator('label.switch')
            .filter({ has: this.inputIncluirImagenes });
    }
    private get inputIncluirDescripcion(): Locator {
        return this.page.locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-switch:impresion-descripcion"]'
        );
    }
    private get toggleIncluirDescripcion(): Locator {
        return this.page
            .locator('label.switch')
            .filter({ has: this.inputIncluirDescripcion });
    }

    async activarIncluirImagenes(): Promise<void> {
        
        await this.toggleIncluirImagenes.click();
    }

    async activarIncluirDescripcion(): Promise<void> {
        await this.toggleIncluirDescripcion.click();
    }

    private get selectorVigencia(): Locator {
        return this.page.locator('.v-select-base-header').filter({ hasText: /^\d+ días?$/ }).first();
    }

    async seleccionarVigencia(dias: string): Promise<void> {
        await esperarCargaOverlaySiVisible(this.page);
        await this.selectorVigencia.click();
        await this.page
            .locator('.v-select-form-option, .v-select-small-option')
            .getByText(dias, { exact: true })
            .click();
    }

    async seleccionarIGV(porcentaje: string): Promise<void> {
        await this.page.locator('.v-select-base-header').filter({ hasText: /^\d+\.?\d*%$/ }).first().click();
        await this.page
            .locator('.v-select-form-option, .v-select-small-option')
            .getByText(porcentaje, { exact: true })
            .click();
    }
}
