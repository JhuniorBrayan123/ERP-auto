import { expect, type Page } from '@playwright/test';
import { CierreCajaTargets } from '@screenplay/targets/cierre-caja/CierreCajaTargets';
import { IngresosEgresosTargets } from '@screenplay/targets/cierre-caja/IngresosEgresosTargets';
import { obtenerMovimientoPorId, type MovimientoCaja } from '@services/PuntoVenta/CajaMovimientosApi';


export const ConsultarIngresosYEgresos = () => {
    const fn = async (page: Page): Promise<void> => {
        await CierreCajaTargets.tabIngresosEgresos(page).click();
        await expect(IngresosEgresosTargets.inputBuscarSerieCorrelativo(page)).toBeVisible({ timeout: 10_000 });
    };
    fn.displayName = 'Consultar Ingresos y Egresos en Cierre de Caja';
    return fn;
};


export const BuscarMovimientoEnCierre = (idDocFinanciero: number) => {
    const fn = async (page: Page): Promise<MovimientoCaja> => {
        
        const input = IngresosEgresosTargets.inputBuscarSerieCorrelativo(page);
        await input.click();
        await input.fill('');
        await input.press('Enter');

        
        const [movimiento] = await Promise.all([
            obtenerMovimientoPorId(page, idDocFinanciero),
            input.press('Enter'),
        ]);

        return movimiento;
    };

    fn.displayName = `Buscar movimiento en cierre por IdDocFinanciero=${idDocFinanciero}`;
    return fn;
};


export const BuscarMovimientoEnCierrePorConcepto = (concepto: string) => {
    const fn = async (page: Page): Promise<MovimientoCaja> => {
        
        const input = IngresosEgresosTargets.inputBuscarSerieCorrelativo(page);
        await input.click();
        await input.fill('');
        
        // Interceptar la llamada a movimientos y encontrar el movimiento por Concepto
        const [movimiento] = await Promise.all([
            require('@services/PuntoVenta/CajaMovimientosApi').obtenerMovimientoPorConcepto(page, concepto),
            input.press('Enter'),
        ]);

        return movimiento;
    };

    fn.displayName = `Buscar movimiento en cierre por Concepto=${concepto}`;
    return fn;
};


export const BuscarEnIngresosEgresos = (textoBusqueda: string) => {
    const fn = async (page: Page): Promise<void> => {
        const input = IngresosEgresosTargets.inputBuscarSerieCorrelativo(page);
        await input.click();
        await input.fill(textoBusqueda);
        await input.press('Enter');
        
        
        const { esperarCargaOverlay } = require('@utils/wait-helpers');
        await esperarCargaOverlay(page);
    };

    fn.displayName = `Buscar "${textoBusqueda}" en Ingresos y Egresos`;
    return fn;
};
