import {type Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import type {EmisionResult} from '@app-types/emision.types';

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
