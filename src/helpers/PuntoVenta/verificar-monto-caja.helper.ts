import {expect} from '@playwright/test';
import type {CajasApi} from '@services/PuntoVenta/CajasApi';
import {SUCURSAL} from '@helpers/PuntoVenta/emision-data.helper';

export interface DatosMontoCaja {
    cajasApi: CajasApi;
    montoInicial: number;
    montoDespuesVenta: number;
    montoTotalVenta: number;
    retornoDinero: boolean;
    sucursalId?: number;
}

type DatosMontoDespuesVenta = Pick<
    DatosMontoCaja,
    'cajasApi' | 'montoInicial' | 'montoTotalVenta' | 'sucursalId'
>;

type DatosRetornoDinero = Pick<
    DatosMontoCaja,
    'cajasApi' | 'montoInicial' | 'montoDespuesVenta' | 'retornoDinero' | 'sucursalId'
>;

export async function capturarMontoCaja(
    cajasApi: CajasApi,
    sucursalId: number = SUCURSAL.id,
): Promise<number> {
    return cajasApi.obtenerMontoActualSoles(sucursalId);
}

/**
 * Valida que el monto en SOLES de la caja suba ~montoTotalVenta tras la venta
 * (monto ≈ montoInicial + montoTotalVenta), con tolerancia de 2 decimales.
 */
export async function validarMontoCajaDespuesVenta(datos: DatosMontoDespuesVenta): Promise<void> {
    const {
        cajasApi,
        montoInicial,
        montoTotalVenta,
        sucursalId = SUCURSAL.id,
    } = datos;

    const montoEsperado = montoInicial + montoTotalVenta;

    await expect
        .poll(
            async () => cajasApi.obtenerMontoActualSoles(sucursalId),
            {
                message: `El monto en SOLES de la caja debe subir de ${montoInicial} a ≈ ${montoEsperado} tras la venta`,
                timeout: 30_000,
                intervals: [2_000, 3_000, 5_000],
            }
        )
        .toBeCloseTo(montoEsperado, 2);
}

/**
 * Valida el retorno del dinero en SOLES tras la anulación del comprobante.
 * Si retornoDinero=true, el monto debe regresar al valor inicial (delta neto ~0);
 * si es false, debe mantenerse en el valor posterior a la venta.
 */
export async function validarRetornoDineroCaja(datos: DatosRetornoDinero): Promise<void> {
    const {
        cajasApi,
        montoInicial,
        montoDespuesVenta,
        retornoDinero,
        sucursalId = SUCURSAL.id,
    } = datos;

    const montoEsperado = retornoDinero ? montoInicial : montoDespuesVenta;

    await expect
        .poll(
            async () => cajasApi.obtenerMontoActualSoles(sucursalId),
            {
                message: retornoDinero
                    ? `El monto en SOLES de la caja debe retornar de ${montoDespuesVenta} a ${montoEsperado} (delta neto ~0) tras la anulación`
                    : `El monto en SOLES de la caja debe mantenerse en ${montoEsperado} (sin retorno)`,
                timeout: 30_000,
                intervals: [2_000, 3_000, 5_000],
            }
        )
        .toBeCloseTo(montoEsperado, 2);
}
