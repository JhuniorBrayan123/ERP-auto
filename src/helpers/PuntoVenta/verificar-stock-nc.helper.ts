import {expect} from '@playwright/test';
import type {KardexApi} from '@services/Logistica/KardexApi';

export interface DatosStockNC {
    kardexApi: KardexApi;
    codigoProducto: string;
    stockOriginal: number;
    stockDespuesVenta: number;
    cantidadDevuelta: number;
    retornoStock: boolean;
    almacenFiltro?: string;
}

export async function validarStockDespuesNC(datos: DatosStockNC): Promise<void> {
    const {
        kardexApi,
        codigoProducto,
        stockOriginal,
        stockDespuesVenta,
        cantidadDevuelta,
        retornoStock,
        almacenFiltro = 'AUTO',
    } = datos;

    const stockEsperado = retornoStock
        ? stockDespuesVenta + cantidadDevuelta
        : stockDespuesVenta;

    await expect
        .poll(
            async () =>
                kardexApi.obtenerSaldoPorProducto({codigoProducto, almacenFiltro}),
            {
                message: retornoStock
                    ? `El stock de "${codigoProducto}" debe haber retornado de ${stockDespuesVenta} a ${stockEsperado}`
                    : `El stock de "${codigoProducto}" debe mantenerse en ${stockEsperado} (sin retorno)`,
                timeout: 30_000,
                intervals: [2_000, 3_000, 5_000],
            }
        )
        .toBe(stockEsperado);
}

export async function capturarStockNC(
    kardexApi: KardexApi,
    codigoProducto: string,
    almacenFiltro: string = 'AUTO',
): Promise<number> {
    return kardexApi.obtenerSaldoPorProducto({codigoProducto, almacenFiltro});
}
