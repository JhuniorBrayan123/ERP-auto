import {expect} from '@playwright/test';
import type {CajasApi} from '@services/PuntoVenta/CajasApi';

export interface DatosMontoCaja {
    cajasApi: CajasApi;
    montoInicial: number;
    montoDespuesVenta: number;
    montoTotalVenta: number;
    retornoDinero: boolean;
    sucursalId?: number;
    nombreCaja?: string;
}

type DatosMontoDespuesVenta = Pick<
    DatosMontoCaja,
    'cajasApi' | 'montoInicial' | 'montoTotalVenta' | 'sucursalId' | 'nombreCaja'
>;

type DatosRetornoDinero = Pick<
    DatosMontoCaja,
    'cajasApi' | 'montoInicial' | 'montoDespuesVenta' | 'retornoDinero' | 'sucursalId' | 'nombreCaja'
>;

export async function capturarMontoCaja(
    cajasApi: CajasApi,
    sucursalId?: number,
    nombreCaja?: string,
): Promise<number> {
    const monto = sucursalId
        ? await cajasApi.obtenerMontoActualSoles(sucursalId, nombreCaja)
        : await cajasApi.obtenerMontoActualSoles(undefined, nombreCaja);
    console.log(`   [Caja] Monto actual capturado: S/ ${monto}`);
    return monto;
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
        sucursalId,
        nombreCaja,
    } = datos;

    const montoEsperado = montoInicial + montoTotalVenta;
    console.log(
        `   [Caja] Validando alza de monto: inicial S/ ${montoInicial} + venta S/ ${montoTotalVenta} = esperado S/ ${montoEsperado}`,
    );

    await expect
        .poll(
            async () => {
                const actual = await cajasApi.obtenerMontoActualSoles(sucursalId, nombreCaja);
                console.log(
                    `   [Caja] Poll alza: actual S/ ${actual} vs esperado S/ ${montoEsperado}`,
                );
                return actual;
            },
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
        sucursalId,
        nombreCaja,
    } = datos;

    const montoEsperado = retornoDinero ? montoInicial : montoDespuesVenta;

    await expect
        .poll(
            async () => {
                const actual = await cajasApi.obtenerMontoActualSoles(sucursalId, nombreCaja);
                console.log(
                    `   [Caja] Poll retorno: actual S/ ${actual} vs esperado S/ ${montoEsperado}`,
                );
                return actual;
            },
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
