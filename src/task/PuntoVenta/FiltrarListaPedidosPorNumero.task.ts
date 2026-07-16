import {type Page} from '@playwright/test';

export const FiltrarListaPedidosPorNumero = (numero: string) => {
    const fn = async (page: Page): Promise<void> => {
        await page.locator('[id="pv_cmp-facturacion_cmp-pedidos_cmp_lista-pedido:filter_section:section_tipo_tipo_item:numero-pedido"]').first().click();
        const input = page.locator('[id="pv_cmp-facturacion_cmp-pedidos_cmp_lista-pedido:filter_section_v-input:correlativo"]');
        await input.click();
        await input.fill(numero);
        await page.waitForTimeout(1000);
    };
    fn.displayName = `Filtrar pedidos por número: ${numero}`;
    return fn;
};
