import {type Page} from '@playwright/test';
import {PedidoListaPage} from '@pages/PuntoVenta/PedidoListaPage';

export const FiltrarListaPedidosPorNumero = (numero: string) => {
    const fn = async (page: Page): Promise<void> => {
        const listaPage = new PedidoListaPage(page);
        await listaPage.filtrarPorNroPedido(numero);
    };
    fn.displayName = `Filtrar pedidos por número: ${numero}`;
    return fn;
};
