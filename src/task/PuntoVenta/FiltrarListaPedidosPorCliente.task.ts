import {type Page} from '@playwright/test';
import type {DatosCliente} from '@app-types/emision.types';

export const FiltrarListaPedidosPorCliente = (cliente: DatosCliente & { textoSelector?: string }) => {
    const fn = async (page: Page): Promise<void> => {
        await page.getByText('Cliente', { exact: true }).click();
        const input = page.locator('[id="pv_cmp-facturacion_cmp-pedidos_cmp_lista-pedido:filter_section_v-input:cliente"]');
        await input.click();
        await input.fill(cliente.documento);
        await page.getByText(cliente.textoSelector || cliente.nombre).nth(1).click();
    };
    fn.displayName = `Filtrar pedidos por cliente: ${cliente.nombre}`;
    return fn;
};
