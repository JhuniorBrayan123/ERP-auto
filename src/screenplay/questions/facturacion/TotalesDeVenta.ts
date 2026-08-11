import { type Page } from '@playwright/test';
import { EmisionPage } from '@pages/PuntoVenta/EmisionPage';

export interface TotalesVenta {
    subtotal?: string;
    igv?: string;
    descuento?: string;
    total?: string;
}

export const TotalesDeVenta = () => {
    const fn = async (page: Page): Promise<Record<string, string>> => {
        const emisionPage = new EmisionPage(page);
        await emisionPage.abrirTotales();
        return await emisionPage.capturarTotalesPopup();
    };
    fn.displayName = 'Leer totales de la venta';
    return fn;
};
