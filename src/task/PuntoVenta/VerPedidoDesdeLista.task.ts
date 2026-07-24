import {type Page} from '@playwright/test';
import {PedidoListaPage} from '@pages/PuntoVenta/PedidoListaPage';

export const VerPedidoDesdeLista = (numPedido: string) => {
    const fn = async (page: Page): Promise<Page> => {
        const pedidoLista = new PedidoListaPage(page);
        await pedidoLista.filtrarPorNroPedido(numPedido);
        await pedidoLista.abrirOpcionesPedido();
        return await pedidoLista.clickVerPedido();
    };
    fn.displayName = `Ver pedido desde lista: ${numPedido}`;
    return fn;
};
