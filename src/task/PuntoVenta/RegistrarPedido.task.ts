import { type Page } from '@playwright/test';
import { EmisionPage } from '@pages/PuntoVenta/EmisionPage';

export const RegistrarPedido = () => {
    const fn = async (page: Page): Promise<void> => {
        const emisionPage = new EmisionPage(page);
        await emisionPage.guardarPedido();
    };
    fn.displayName = `Registrar pedido`;
    return fn;
};
