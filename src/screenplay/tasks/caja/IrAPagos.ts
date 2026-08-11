import { expect, type Page } from '@playwright/test';
import { MenuCajaTargets } from '@screenplay/targets/caja/MenuCajaTargets';
import { CobrosPagosTargets } from '@screenplay/targets/cierre-caja/CobrosPagosTargets';
import { capturarIdDocFinancieroPago } from '@services/PuntoVenta/CajaMovimientosApi';
import { esperarCargaOverlay } from '@utils/wait-helpers';

export interface DatosPago {
        estadoFiltro?: string;
        tipoComprobante?: string;
        monto: string;
}

export interface ResultadoPago {
        idDocFinanciero: number;
}


export const IrAPagos = () => {
    const fn = async (page: Page): Promise<void> => {
        await MenuCajaTargets.btnAbrirMenu(page).click();
        await MenuCajaTargets.opcionPagos(page).click();
        
        await esperarCargaOverlay(page);
        
        await expect(page.getByRole('button', { name: /^Buscar$/i })).toBeVisible({ timeout: 10_000 });
    };
    fn.displayName = 'Ir al módulo de Pagos';
    return fn;
};


export const RegistrarPagoProveedor = (datos: DatosPago) => {
    const fn = async (page: Page): Promise<ResultadoPago> => {
        
        await CobrosPagosTargets.selectorEstadoPago(page).click();
        await page.getByText('Todos').nth(1).click();
        await CobrosPagosTargets.opcionPagoPendiente(page).click();

        if (datos.tipoComprobante) {
            await page.locator('div:nth-child(2) > .v-multiselect > .v-multiselect-form > .v-multiselect-base > .v-popup > span > .v-multiselect-base-header > .v-multiselect-form-header > .text').click();
            await page.getByText('Todos').nth(2).click();
            await page.getByText(datos.tipoComprobante).click();
        }

        await CobrosPagosTargets.btnBuscarCobros(page).click();

        
        await CobrosPagosTargets.btnPagar(page).click();
        await CobrosPagosTargets.btnAgregarCuota(page).click();
        await CobrosPagosTargets.btnGuardarCuota(page).click();

        await CobrosPagosTargets.inputMontoPago(page).click();
        await CobrosPagosTargets.inputMontoPago(page).fill(datos.monto);

        
        const [idDocFinanciero] = await Promise.all([
            capturarIdDocFinancieroPago(page),
            CobrosPagosTargets.btnAceptarPago(page).click(),
        ]);

        await expect(CobrosPagosTargets.toastPagoExitoso(page)).toBeVisible({ timeout: 15_000 });
        await CobrosPagosTargets.btnAceptarPago(page).click();

        return { idDocFinanciero };
    };

    fn.displayName = `Registrar pago a proveedor — S/${datos.monto}`;
    return fn;
};
