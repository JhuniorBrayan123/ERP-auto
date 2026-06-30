import { expect, type Page } from '@playwright/test';
import { CierreCajaTargets } from '@screenplay/targets/cierre-caja/CierreCajaTargets';
import { CobrosPagosTargets } from '@screenplay/targets/cierre-caja/CobrosPagosTargets';
import { obtenerMovimientoPorId, type MovimientoCaja } from '@services/PuntoVenta/CajaMovimientosApi';
import { esperarCargaOverlay } from '@utils/wait-helpers';

// ─── Task: ConsultarCobrosYPagos ─────────────────────────────────────────────
export const ConsultarCobrosYPagos = () => {
    const fn = async (page: Page): Promise<void> => {
        await CierreCajaTargets.tabCobrosPagos(page).click();
        
        await esperarCargaOverlay(page);
        
        await expect(CobrosPagosTargets.inputBuscarSerieCorrelativo(page)).toBeVisible({ timeout: 10_000 });
    };
    fn.displayName = 'Consultar Cobros y Pagos en Cierre de Caja';
    return fn;
};

// ─── Task: BuscarCobroEnCierre ────────────────────────────────────────────────
/**
 * Busca un cobro específico en la pestaña "Cobros y pagos" usando el IdDocFinanciero
 * capturado al momento de crear el cobro.
 *
 * El ERP devuelve el correlativo del recibo (ej: RC01-497) en el endpoint de movimientos.
 */
export const BuscarCobroEnCierre = (idDocFinanciero: number) => {
    const fn = async (page: Page): Promise<MovimientoCaja> => {
        const input = CobrosPagosTargets.inputBuscarSerieCorrelativo(page);
        await input.click();
        await input.fill('');

        // 1. Obtener la data interceptando la carga general (sin filtro)
        const [movimiento] = await Promise.all([
            obtenerMovimientoPorId(page, idDocFinanciero),
            input.press('Enter'),
        ]);

        // 2. Ahora que tenemos el correlativo (ej: 512), lo buscamos en el input para que la UI lo muestre
        await input.click();
        await input.fill(movimiento.CorrelativoDocFinanciero.toString());
        await input.press('Enter');

        await esperarCargaOverlay(page);

        return movimiento;
    };

    fn.displayName = `Buscar cobro en cierre por IdDocFinanciero=${idDocFinanciero}`;
    return fn;
};

// ─── Task: BuscarPagoEnCierre ─────────────────────────────────────────────────
/**
 * Busca un pago registrado en la sección "Pagos" de la pestaña Cobros y pagos.
 */
export const BuscarPagoEnCierre = (idDocFinanciero: number) => {
    const fn = async (page: Page): Promise<MovimientoCaja> => {
        const input = CobrosPagosTargets.inputBuscarSerieCorrelativo(page);
        await input.click();
        await input.fill('');

        const [movimiento] = await Promise.all([
            obtenerMovimientoPorId(page, idDocFinanciero),
            input.press('Enter'),
        ]);

        await input.click();
        await input.fill(movimiento.CorrelativoDocFinanciero.toString());
        await input.press('Enter');

        await esperarCargaOverlay(page);

        return movimiento;
    };

    fn.displayName = `Buscar pago en cierre por IdDocFinanciero=${idDocFinanciero}`;
    return fn;
};
