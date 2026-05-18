import { Page } from '@playwright/test';
import type { DatosClienteConSelector } from '../../types/cliente.types';
import { esperarDebounce } from '../../utils/wait-helpers';

export class EmisionAdelantosPage {
    constructor(private readonly page: Page) { }

    async clickAnadirCampos(): Promise<void> {
        await this.page.getByText('AÑADIR CAMPOS').click();
    }

    /** Activa el switch de Doc. Adelanto */
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

        // Damos click directamente al slider.
        await slider.click();

        // Localizamos el input usando las clases de su contenedor en lugar de xpath
        const inputRetencion = this.page.locator('div.v-input-small-type input.erp-input').last();

        // Esperamos a que el input sea visible (por si hay una animación al prender el switch)
        await inputRetencion.waitFor({ state: 'visible', timeout: 5000 });

        // Limpiamos con atajos de teclado porque .clear() falla en algunos inputs de Vue
        await inputRetencion.click();
        await this.page.waitForTimeout(100);
        await inputRetencion.press('Control+A');
        await inputRetencion.press('Backspace');
        await this.page.waitForTimeout(300);

        // Ingresamos el porcentaje. El delay permite que Vue procese cada tecla.
        await inputRetencion.pressSequentially(porcentaje, { delay: 150 });

        // Como el botón "Guardar" solo aparece en el DOM después de modificar el valor, lo esperamos explícitamente
        const btnGuardar = this.page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-button:guardar-datos-retencion"]');
        await btnGuardar.waitFor({ state: 'visible', timeout: 5000 });
        await btnGuardar.click();
        await this.page.locator('.v-modal > div').first().click();
    }

    /**
     * Abre el modal de adelantos. Si el botón no aparece rápido (falla común del ERP al no procesar el cliente),
     * limpia el input de cliente y vuelve a seleccionarlo para forzar el cálculo.
     */
    async abrirAdelantos(cliente: DatosClienteConSelector): Promise<void> {
        const btnAdelantos = this.page.getByRole('button', { name: 'Adelantos' });

        try {
            await btnAdelantos.waitFor({ state: 'visible', timeout: 5000 });
        } catch (e) {
            // Para cambiar/limpiar el cliente, debemos hacer click en su ícono de eliminar
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
