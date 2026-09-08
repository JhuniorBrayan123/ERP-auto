import {Page} from '@playwright/test';
import {PedidoListaPage} from '@pages/PuntoVenta/PedidoListaPage';

type VistaPedido = 'puntoVenta' | 'facturacion';

export const AbrirListaPedidos = (
    vista: VistaPedido = 'puntoVenta'
) => {
    const fn = async (page: Page): Promise<void> => {
        const pedidosLista = new PedidoListaPage(page);

        if (vista === 'puntoVenta') {
            await pedidosLista.clickBuscarPedidos();
            await pedidosLista.clickVerTodos();
            return;
        }

        await pedidosLista.buscarEnFacturacion();
    };

    fn.displayName = `Abrir lista de pedidos (${vista})`;

    return fn;
};