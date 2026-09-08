import { expect, type Page } from '@playwright/test';
import { MenuCajaTargets } from '@screenplay/targets/caja/MenuCajaTargets';
import { CobrosPagosTargets } from '@screenplay/targets/cierre-caja/CobrosPagosTargets';
import {esperarCargaOverlaySiVisible} from '@utils/wait-helpers';
import { capturarIdDocFinancieroCobro } from '@services/PuntoVenta/CajaMovimientosApi';

export interface DatosCobro {
        monto: string;
        correlativoComprobante?: string;
        tipoDocumentoId?: '1003' | '1004' | '1006' | '2016';
}

export interface ResultadoCobro {
        idDocFinanciero: number;
}


export const IrACobros = () => {
    const fn = async (page: Page): Promise<void> => {
        await MenuCajaTargets.btnAbrirMenu(page).click();
        await MenuCajaTargets.opcionCobros(page).click();

        await esperarCargaOverlaySiVisible(page);
        
        await expect(page.getByRole('button', { name: /^Buscar$/i })).toBeVisible({ timeout: 10_000 });
    };
    fn.displayName = 'Ir al módulo de Cobros';
    return fn;
};


export const RegistrarCobroCliente = (datos: DatosCobro) => {
    const fn = async (page: Page): Promise<ResultadoCobro> => {
        
        await CobrosPagosTargets.selectorEstadoCobro(page).click();
        await page.getByText('Todos').nth(1).click();
        await CobrosPagosTargets.opcionCobroPendiente(page).click();

        
        if (datos.tipoDocumentoId) {
            await CobrosPagosTargets.selectorTipoComprobanteCobro(page).click();
            
            await CobrosPagosTargets.checkboxTipoComprobanteTodos(page).click();
            
            await CobrosPagosTargets.checkboxTipoComprobanteOpcion(page, datos.tipoDocumentoId).click();
            
            await page.mouse.click(0, 0); 
        }

        await CobrosPagosTargets.btnBuscarCobros(page).click();

        
        let filaCobro;
        if (datos.correlativoComprobante) {
            filaCobro = page.getByRole('row', {
                name: new RegExp(datos.correlativoComprobante),
            });
        }

        
        await CobrosPagosTargets.btnCobrarFila(page).click();

        
        const alertVisible = await page.getByText(/El comprobante seleccionado/i).isVisible({ timeout: 2_000 }).catch(() => false);
        if (alertVisible) {
            await CobrosPagosTargets.btnAceptarCobro(page).click();
            await CobrosPagosTargets.btnCobrarFila(page).click();
        }

        
        await CobrosPagosTargets.inputMontoCobro(page).click();
        await CobrosPagosTargets.inputMontoCobro(page).fill(datos.monto);

        
        const [idDocFinanciero] = await Promise.all([
            capturarIdDocFinancieroCobro(page),
            CobrosPagosTargets.btnAceptarCobro(page).click(),
        ]);

        await expect(CobrosPagosTargets.toastCobroExitoso(page)).toBeVisible({ timeout: 15_000 });
        await CobrosPagosTargets.btnAceptarCobro(page).click();
        await esperarCargaOverlaySiVisible(page);

        return { idDocFinanciero };
    };

    fn.displayName = `Registrar cobro a cliente — S/${datos.monto}`;
    return fn;
};
