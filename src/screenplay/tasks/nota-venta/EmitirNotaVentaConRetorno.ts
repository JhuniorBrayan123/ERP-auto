import {expect, type Page} from '@playwright/test';
import {CajaPage} from '@pages/PuntoVenta/CajaPage';
import {ComprobantePage} from '@pages/PuntoVenta/ComprobantePage';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';
import {capturarStockNC} from '@helpers/PuntoVenta/verificar-stock-nc.helper';
import {
    capturarMontoCaja,
    validarMontoCajaDespuesVenta,
} from '@helpers/PuntoVenta/verificar-monto-caja.helper';
import {esperarStockDespuesVenta} from '@helpers/PuntoVenta/esperarStockDespuesVenta';
import {recargarSiHayError} from '@utils/wait-helpers';
import type {KardexApi} from '@services/Logistica/KardexApi';
import type {CajasApi} from '@services/PuntoVenta/CajasApi';
import type {ItemVenta} from '@app-types/emision.types';

export interface ResultadoEmitirNotaVenta {
    numeroCompleto: string;
    correlativo: string;
    montoInicial: number;
    stockOriginal: number;
    stockDespuesVenta: number;
    montoTotalCarrito: number;
    nombreCaja: string;
}


export const EmitirNotaVentaConRetorno = ({
    item,
    kardexApi,
    cajasApi,
}: {
    item: ItemVenta;
    kardexApi: KardexApi;
    cajasApi: CajasApi;
}) => {
    const fn = async (page: Page): Promise<ResultadoEmitirNotaVenta> => {
        const cajaPage = new CajaPage(page);
        const comprobantePage = new ComprobantePage(page);
        const emisionPage = new EmisionPage(page);
        const postEmisionPage = new PostEmisionPage(page);
        const nombreCaja = cajaPage.nombreCajaActiva;

        await cajaPage.continuarVendiendo();
        await comprobantePage.seleccionarNotaVenta();

        const stockOriginal = await capturarStockNC(kardexApi, item.codigo);
        const montoInicial = await capturarMontoCaja(cajasApi, undefined, nombreCaja);

        await emisionPage.buscarItem(item.codigo);
        await emisionPage.seleccionarItem(item.nombre);
        const resumen = await emisionPage.capturarResumenPedido();
        const montoTotalCarrito = parseFloat(resumen['Total'] ?? resumen['TOTAL'] ?? '0') || 0;
        await emisionPage.emitirConEfectivoExacto();

        const emision = emisionPage.ultimaEmision;
        if (!emision?.correlativo) {
            throw new Error('No se obtuvo correlativo tras emitir la Nota de Venta');
        }
        const numeroCompleto = `${emision.serie}-${emision.correlativo}`;
        const correlativo = emision.correlativo;

        await postEmisionPage.clickNuevaVenta();
        await recargarSiHayError(page);

        const stockDespuesVenta = await esperarStockDespuesVenta({
            kardexApi,
            codigoProducto: item.codigo,
            stockOriginal,
            cantidadVendida: item.cantidad,
        });

        await validarMontoCajaDespuesVenta({
            cajasApi,
            montoInicial,
            montoTotalVenta: montoTotalCarrito,
            nombreCaja,
        });

        return {numeroCompleto, correlativo, montoInicial, stockOriginal, stockDespuesVenta, montoTotalCarrito, nombreCaja};
    };

    fn.displayName = `Emitir Nota de Venta ${item.codigo} con retorno de stock`;
    return fn;
};