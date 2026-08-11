import { type Page } from '@playwright/test';
import { ComprobantePage } from '@pages/PuntoVenta/ComprobantePage';
import type { TipoComprobante } from '@app-types/emision.types';

export const SeleccionarTipoComprobante = (tipo: TipoComprobante) => {
    const fn = async (page: Page): Promise<void> => {
        const comprobantePage = new ComprobantePage(page);
        await comprobantePage.seleccionarTipoComprobante(tipo);
    };
    fn.displayName = `Seleccionar tipo de comprobante: ${tipo}`;
    return fn;
};
