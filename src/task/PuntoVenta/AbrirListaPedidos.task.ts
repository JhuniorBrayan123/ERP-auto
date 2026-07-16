import {type Page} from '@playwright/test';
import {PedidoListaPage} from '@pages/PuntoVenta/PedidoListaPage';

export const AbrirListaPedidos = () => {
    const fn = async (page: Page): Promise<void> => {
        const pedidoLista = new PedidoListaPage(page);
        await pedidoLista.clickVerTodos();
    };
    fn.displayName = 'Abrir lista de pedidos (Ver todos)';
    return fn;
};
