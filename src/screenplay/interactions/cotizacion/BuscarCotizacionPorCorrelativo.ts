import { type Page } from '@playwright/test';
import { CotizacionTargets } from '@screenplay/targets/cotizacion/CotizacionTargets';
import { FacturacionTargets } from '@screenplay/targets/facturacion/FacturacionTargets';
import { esperarCargaOverlaySiVisible } from '@utils/wait-helpers';

export const BuscarCotizacionPorCorrelativo = (correlativo: string) => {
    const fn = async (page: Page): Promise<void> => {
        
        await esperarCargaOverlaySiVisible(page).catch(() => {});


        const inputCorrelativo = CotizacionTargets.inputCorrelativo(page);
        await inputCorrelativo.click();
        await inputCorrelativo.fill(correlativo);

        
        await CotizacionTargets.btnBuscar(page).click();
        await esperarCargaOverlaySiVisible(page).catch(() => {});
    };
    fn.displayName = `Buscar cotización por correlativo: ${correlativo}`;
    return fn;
};
