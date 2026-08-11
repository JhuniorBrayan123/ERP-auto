import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';

export const AbrirTotales = () => {
    const fn = async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.abrirTotales();
    };
    fn.displayName = 'Abrir totales';
    return fn;
};
