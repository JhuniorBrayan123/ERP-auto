import { type Page } from '@playwright/test';
import { CotizacionTargets } from '@screenplay/targets/cotizacion/CotizacionTargets';
import { FacturacionTargets } from '@screenplay/targets/facturacion/FacturacionTargets';
import { esperarCargaOverlay } from '@utils/wait-helpers';

export const BuscarCotizacionPorCorrelativo = (correlativo: string) => {
    const fn = async (page: Page): Promise<void> => {
        // Asegurar que la vista está limpia, a veces el dropdown de serie se queda trabado
        await esperarCargaOverlay(page).catch(() => {});
        
        // 1. Ingresar correlativo
        const inputCorrelativo = CotizacionTargets.inputCorrelativo(page);
        await inputCorrelativo.click();
        await inputCorrelativo.fill(correlativo);

        // 2. Click en Buscar
        await CotizacionTargets.btnBuscar(page).click();
        await esperarCargaOverlay(page).catch(() => {});
    };
    fn.displayName = `Buscar cotización por correlativo: ${correlativo}`;
    return fn;
};
