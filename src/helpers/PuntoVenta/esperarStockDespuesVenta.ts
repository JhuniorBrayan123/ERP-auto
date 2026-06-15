import {expect} from '@playwright/test';
import type {KardexApi} from '@services/Logistica/KardexApi';

export async function esperarStockDespuesVenta({
                                                   kardexApi,
                                                   codigoProducto,
                                                   stockOriginal,
                                                   cantidadVendida,
                                                   almacenFiltro = 'AUTO',
                                               }: {
    kardexApi: KardexApi;
    codigoProducto: string;
    stockOriginal: number;
    cantidadVendida: number;
    almacenFiltro?: string;
}): Promise<number> {
    const stockEsperadoDespuesVenta = stockOriginal - cantidadVendida;

    await expect
        .poll(
            async () =>
                kardexApi.obtenerSaldoPorProducto({
                    codigoProducto,
                    almacenFiltro,
                }),
            {
                message: `El stock de "${codigoProducto}" debe bajar de ${stockOriginal} a ${stockEsperadoDespuesVenta} después de la venta`,
                timeout: 90_000,
                intervals: [2_000, 3_000, 5_000, 10_000],
            }
        )
        .toBe(stockEsperadoDespuesVenta);

    return stockEsperadoDespuesVenta;
}