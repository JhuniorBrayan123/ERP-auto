import {type Page} from '@playwright/test';
import {PedidoListaPage} from '@pages/PuntoVenta/PedidoListaPage';

export const BuscarPedidoPorCorrelativo = (correlativo: string) => {
    const fn = async (page: Page): Promise<void> => {
        const pedidoLista = new PedidoListaPage(page);
        await pedidoLista.clickBuscarPedidos();
        const inputCorrelativo = page.getByRole('textbox', { name: 'Correlativo' });
        await inputCorrelativo.click();
        await inputCorrelativo.fill(correlativo);
        await inputCorrelativo.press('Enter');
    };
    fn.displayName = `Buscar pedido por correlativo: ${correlativo}`;
    return fn;
};
