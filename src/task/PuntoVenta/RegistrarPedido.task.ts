import {type Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import type {EmisionResult} from '@app-types/emision.types';

/**
 * Parámetro opcional para recibir el resultado de la operación.
 * Se usa cuando el test necesita el correlativo/serie capturado por API
 * en lugar de parsear el DOM.
 *
 * @example
 * const pedido = { current: null as EmisionResult | null };
 * await cajero.intentaRealizar(
 *     ..., RegistrarPedido(pedido)
 * );
 * const correlativo = pedido.current?.correlativo ?? '';
 */
export type EmisionOutputRef = { current: EmisionResult | null };

export const RegistrarPedido = (outputRef?: EmisionOutputRef) => {
    const fn = async (page: Page): Promise<void> => {
        const emisionPage = new EmisionPage(page);
        const result = await emisionPage.guardarPedido();
        if (outputRef) {
            outputRef.current = result;
        }
    };
    fn.displayName = `Registrar pedido`;
    return fn;
};
