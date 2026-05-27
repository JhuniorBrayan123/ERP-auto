import {type Page} from '@playwright/test';

export const FiltrarComprobantePorTipo = (tipo: 'COTIZACIONES' | 'PEDIDOS') => {
    const fn = async (page: Page): Promise<void> => {
        await page.locator(`[id="pv_comprobantes_cmp-header-comprobantes_categorias:pill-${tipo}"]`).click();
    };
    fn.displayName = `Filtrar comprobantes por tipo: ${tipo}`;
    return fn;
};
