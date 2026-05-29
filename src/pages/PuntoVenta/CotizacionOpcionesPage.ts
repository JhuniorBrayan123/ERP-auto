import { type Locator, type Page } from '@playwright/test';

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
        return this.page.locator('div').filter({ hasText: /^0 días$/ }).nth(1);
    }

    async seleccionarVigencia(dias: string): Promise<void> {
       await this.selectorVigencia.click();
        await this.page
            .locator('.v-select-small-option')  
            .getByText(dias, { exact: true })   
            .click();
    }
}
