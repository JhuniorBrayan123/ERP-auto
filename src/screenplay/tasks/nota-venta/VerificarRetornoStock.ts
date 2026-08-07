import {type Page} from '@playwright/test';
import {validarStockDespuesNC} from '@helpers/PuntoVenta/verificar-stock-nc.helper';
import type {KardexApi} from '@services/Logistica/KardexApi';
import type {ItemVenta} from '@app-types/emision.types';

/**
 * Verifica que tras la anulación el stock del ítem vuelve al valor original.
 */
export const VerificarRetornoStock = ({
    item,
    kardexApi,
    stockOriginal,
    stockDespuesVenta,
}: {
    item: ItemVenta;
    kardexApi: KardexApi;
    stockOriginal: number;
    stockDespuesVenta: number;
}) => {
    const fn = async (_page: Page): Promise<void> => {
        await validarStockDespuesNC({
            kardexApi,
            codigoProducto: item.codigo,
            stockOriginal,
            stockDespuesVenta,
            cantidadDevuelta: item.cantidad,
            retornoStock: true,
        });
    };

    fn.displayName = `Verificar retorno de stock del ítem ${item.codigo} tras anulación`;
    return fn;
};