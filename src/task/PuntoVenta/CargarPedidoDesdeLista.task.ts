import {type Page} from '@playwright/test';
import {PedidoListaPage} from '@pages/PuntoVenta/PedidoListaPage';
import {esperarCargaOverlaySiVisible} from "@utils/wait-helpers";

export const CargarPedidoDesdeLista = (numeroPedido: string) => {
    const fn = async (page: Page): Promise<void> => {
        const listaPage = new PedidoListaPage(page);
        await listaPage.filtrarPorNroPedido(numeroPedido);
        await listaPage.abrirOpcionesPedido();
        await listaPage.clickCargarPedido();
        await esperarCargaOverlaySiVisible(page)
    };
    fn.displayName = `Cargar pedido desde lista: ${numeroPedido}`;
    return fn;
};

