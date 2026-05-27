import { type Page } from '@playwright/test';
import { PedidoListaPage } from '@pages/PuntoVenta/PedidoListaPage';

export const ClickVerPedido = () => {
    const fn = async (page: Page): Promise<void> => {
        const pedidoListaPage = new PedidoListaPage(page);
        await pedidoListaPage.clickVerPedido();
    };
    fn.displayName = `Click Ver Pedido`;
    return fn;
};
