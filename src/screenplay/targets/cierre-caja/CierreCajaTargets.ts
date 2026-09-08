import type { Page } from '@playwright/test';



export const CierreCajaTargets = {
        contenedorPrincipal: (page: Page) =>
        page.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]'),

        tabVentas: (page: Page) =>
        page.locator('#tab-ventas').nth(1),

        tabIngresosEgresos: (page: Page) =>
        page.locator('#tab-ingresos-egresos:visible').first(),

        tabCobrosPagos: (page: Page) =>
        page.locator('.cmp-tabs-option:visible').getByText('Cobros y pagos', { exact: true }).first(),

        tabAnulacionesNC: (page: Page) =>
        page.locator('.cmp-tabs-option:visible').getByText('Anulaciones y notas de crédito', { exact: true }).first(),

        tabItemsVendidos: (page: Page) =>
        page.getByText('Items vendidos', { exact: true }).nth(1),

        tabDescuentos: (page: Page) =>
        page.getByText('Descuentos', { exact: true }).nth(1),

        tabResumenCaja: (page: Page) =>
        page.locator('#tab-resumen-caja:visible').first(),

        btnDescargar: (page: Page) =>
        page.getByText('Descargar', { exact: true }),

        opcionDescargarExcel: (page: Page) =>
        page.getByText('Descargar Excel', { exact: true }),

        opcionDescargarPDF: (page: Page) =>
        page.getByRole('listitem').filter({ hasText: 'Descargar PDF' }),

        btnCerrarDrape: (page: Page) =>
        page.locator('.drape.is-open > .button-close > .icon'),
};
