import { type Page } from '@playwright/test';
import { EmisionPage } from '@pages/PuntoVenta/EmisionPage';

export const EmitirCotizacion = () => {
    const fn = async (page: Page): Promise<void> => {
        const emisionPage = new EmisionPage(page);

        await emisionPage.clickPagar();
    };
    fn.displayName = `Emitir cotización`;
    return fn;
};
