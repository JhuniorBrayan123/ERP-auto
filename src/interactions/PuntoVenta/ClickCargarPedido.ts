import { type Page } from '@playwright/test';
import { PedidoListaPage } from '@pages/PuntoVenta/PedidoListaPage';

export const ClickCargarPedido = () => {
    const fn = async (page: Page): Promise<void> => {
        const pedidoListaPage = new PedidoListaPage(page);
        await pedidoListaPage.clickCargarPedido();
    };
    fn.displayName = `Click Cargar Pedido`;
    return fn;
};
