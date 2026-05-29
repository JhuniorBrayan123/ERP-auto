import { Page } from '@playwright/test';
import type { DatosClienteConSelector } from '../../types/cliente.types';
import { esperarDebounce } from '../../utils/wait-helpers';

export class EmisionAdelantosPage {
    constructor(private readonly page: Page) { }

    async clickAnadirCampos(): Promise<void> {
        await this.page.getByText('AÑADIR CAMPOS').click();
    }

    async activarDocAdelanto(): Promise<void> {
        const input = this.page.locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-switch:adelanto"]'
        );
        const slider = this.page.locator(
            'label:has([id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-switch:adelanto"]) .slider'
        );
        const isChecked = await input.evaluate((el: HTMLInputElement) => el.checked);

        if (!isChecked) {
            await slider.scrollIntoViewIfNeeded();
            await slider.click({ force: true });
        }
    }

    async activarRetencion(porcentaje: string): Promise<void> {
        const slider = this.page.locator('label:has([id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-switch:retencion"]) .slider');

        await slider.click();

        const inputRetencion = this.page.locator('div.v-input-small-type input.erp-input').last();

        await inputRetencion.waitFor({ state: 'visible', timeout: 5000 });

        await inputRetencion.click();
        await this.page.waitForTimeout(100);
        await inputRetencion.press('Control+A');
        await inputRetencion.press('Backspace');
        await this.page.waitForTimeout(300);

        await inputRetencion.pressSequentially(porcentaje, { delay: 150 });

        const btnGuardar = this.page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-button:guardar-datos-retencion"]');
        await btnGuardar.waitFor({ state: 'visible', timeout: 5000 });
        await btnGuardar.click();
        await this.page.locator('.v-modal > div').first().click();
    }

    async abrirAdelantos(cliente: DatosClienteConSelector): Promise<void> {
        const btnAdelantos = this.page.getByRole('button', { name: 'Adelantos' });

        try {
            await btnAdelantos.waitFor({ state: 'visible', timeout: 5000 });
        } catch (e) {
            
            const deleteIcon = this.page.locator('.delete-icon').first();
            await deleteIcon.click();
            await esperarDebounce(this.page, 1000, 'Debounce al limpiar cliente con el ícono');

            const inputCliente = this.page.getByRole('textbox', { name: 'Buscar por nombre, razón' });
            await inputCliente.click();
            await inputCliente.fill(cliente.documento);
            await this.page.getByText(cliente.textoSelector!).click();

            await btnAdelantos.waitFor({ state: 'visible', timeout: 5000 });
        }

        await btnAdelantos.click();
    }
}
