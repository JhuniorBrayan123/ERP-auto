import { type Page } from '@playwright/test';
import { EmisionPage } from '@pages/PuntoVenta/EmisionPage';

export const EmitirCotizacion = () => {
    const fn = async (page: Page): Promise<void> => {
        const emisionPage = new EmisionPage(page);
        // Para cotización, el flujo es click en PAGAR según el codegen
        // No hay interceptor específico implementado para Cotización aquí aún,
        // pero podemos simplemente dar click.
        await emisionPage.clickPagar();
    };
    fn.displayName = `Emitir cotización`;
    return fn;
};
