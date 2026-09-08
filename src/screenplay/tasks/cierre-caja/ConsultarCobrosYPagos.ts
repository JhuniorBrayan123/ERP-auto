import { expect, type Page } from '@playwright/test';
import { CierreCajaTargets } from '@screenplay/targets/cierre-caja/CierreCajaTargets';
import { CobrosPagosTargets } from '@screenplay/targets/cierre-caja/CobrosPagosTargets';
import { obtenerMovimientoPorId, type MovimientoCaja } from '@services/PuntoVenta/CajaMovimientosApi';
import { esperarCargaOverlaySiVisible } from '@utils/wait-helpers';


export const ConsultarCobrosYPagos = () => {
    const fn = async (page: Page): Promise<void> => {
        await CierreCajaTargets.tabCobrosPagos(page).click();

        await esperarCargaOverlaySiVisible(page);
        
        await expect(CobrosPagosTargets.inputBuscarSerieCorrelativo(page)).toBeVisible({ timeout: 10_000 });
    };
    fn.displayName = 'Consultar Cobros y Pagos en Cierre de Caja';
    return fn;
};


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

        
        await input.click();
        await input.fill(movimiento.CorrelativoDocFinanciero.toString());
        await input.press('Enter');

        await esperarCargaOverlaySiVisible(page);

        return movimiento;
    };

    fn.displayName = `Buscar cobro en cierre por IdDocFinanciero=${idDocFinanciero}`;
    return fn;
};


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

        await esperarCargaOverlaySiVisible(page);

        return movimiento;
    };

    fn.displayName = `Buscar pago en cierre por IdDocFinanciero=${idDocFinanciero}`;
    return fn;
};


export const ExpandirTarjetaCobroResultado = () => {
    const fn = async (page: Page): Promise<void> => {
        await CobrosPagosTargets.iconoExpandirTarjetaResultado(page).first().click();
        await expect(CobrosPagosTargets.cuerpoTarjetaResultado(page).first()).toBeVisible({ timeout: 5_000 });
    };
    fn.displayName = 'Expandir tarjeta del resultado de búsqueda en Cobros y Pagos';
    return fn;
};


export interface DatosTarjetaCobro {
    numeroComprobante: string;
    monto: string;
    nombreCliente: string;
    documentoCliente: string;
}

export const ValidarDatosTarjetaCobroResultado = (datos: DatosTarjetaCobro) => {
    const fn = async (page: Page): Promise<void> => {
        const montoEsperado = `S/ ${Number(datos.monto).toFixed(2)}`;

        await expect(CobrosPagosTargets.comprobanteTarjetaResultado(page)).toContainText(datos.numeroComprobante);
        await expect(CobrosPagosTargets.nombreClienteTarjetaResultado(page)).toContainText(datos.nombreCliente);
        await expect(CobrosPagosTargets.documentoClienteTarjetaResultado(page)).toContainText(datos.documentoCliente);
        await expect(CobrosPagosTargets.montoTotalTarjetaResultado(page)).toContainText(montoEsperado);
    };
    fn.displayName = `Validar datos del cobro en tarjeta: ${datos.numeroComprobante}`;
    return fn;
};
