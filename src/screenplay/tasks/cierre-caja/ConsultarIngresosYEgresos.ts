import { expect, type Page } from '@playwright/test';
import { CierreCajaTargets } from '@screenplay/targets/cierre-caja/CierreCajaTargets';
import { IngresosEgresosTargets } from '@screenplay/targets/cierre-caja/IngresosEgresosTargets';
import { obtenerMovimientoPorId, type MovimientoCaja } from '@services/PuntoVenta/CajaMovimientosApi';
import type { DatosIngresoCaja } from '@screenplay/tasks/caja/RegistrarIngresoCaja';


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


        const { esperarCargaOverlaySiVisible } = require('@utils/wait-helpers');
        await esperarCargaOverlaySiVisible(page);
    };

    fn.displayName = `Buscar "${textoBusqueda}" en Ingresos y Egresos`;
    return fn;
};


export const ExpandirTarjetaResultado = () => {
    const fn = async (page: Page): Promise<void> => {
        await IngresosEgresosTargets.iconoExpandirTarjetaResultado(page).first().click();
        await expect(IngresosEgresosTargets.cuerpoTarjetaResultado(page).first()).toBeVisible({ timeout: 5_000 });
    };
    fn.displayName = 'Expandir tarjeta del resultado de búsqueda en Ingresos y Egresos';
    return fn;
};


export const ValidarDatosTarjetaResultado = (datos: DatosIngresoCaja) => {
    const fn = async (page: Page): Promise<void> => {
        const montoEsperado = `S/${Number(datos.monto).toFixed(2)}`;

        await expect(IngresosEgresosTargets.montoTarjetaResultado(page)).toHaveText(montoEsperado);
        await expect(IngresosEgresosTargets.metodoPagoTarjetaResultado(page)).toHaveText(datos.metodoPago);
        await expect(IngresosEgresosTargets.nombrePersonaTarjetaResultado(page)).toContainText(datos.textoSelectorPersona, { ignoreCase: true });
        await expect(IngresosEgresosTargets.documentoPersonaTarjetaResultado(page)).toContainText(datos.documentoPersona);
        await expect(IngresosEgresosTargets.categoriaMotivoTarjetaResultado(page)).toContainText(datos.categoria);
        await expect(IngresosEgresosTargets.categoriaMotivoTarjetaResultado(page)).toContainText(datos.motivo);
    };
    fn.displayName = `Validar datos del movimiento en tarjeta: ${datos.categoria} / ${datos.motivo}`;
    return fn;
};
