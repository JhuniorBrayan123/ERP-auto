import type { Page } from '@playwright/test';

// ─── Targets de Cierre de Caja (pestañas y contenedor principal) ──────────────

export const CierreCajaTargets = {
    /** Contenedor raíz de la micro-frontend de Punto de Venta */
    contenedorPrincipal: (page: Page) =>
        page.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]'),

    /** Texto "Caja de venta" visible al entrar al cierre */
    tituloCajaVenta: (page: Page) =>
        page.getByText('Caja de venta').nth(1),

    /** Pestaña "Ventas" dentro de cierre de caja */
    tabVentas: (page: Page) =>
        page.locator('#tab-ventas').nth(1),

    /** Pestaña "Ingresos y egresos" dentro de cierre de caja */
    tabIngresosEgresos: (page: Page) =>
        page.locator('#tab-ingresos-egresos:visible').first(),

    /** Pestaña "Cobros y pagos" dentro de cierre de caja */
    tabCobrosPagos: (page: Page) =>
        page.locator('.cmp-tabs-option:visible').getByText('Cobros y pagos', { exact: true }).first(),

    /** Pestaña "Anulaciones y notas de crédito" dentro de cierre de caja */
    tabAnulacionesNC: (page: Page) =>
        page.locator('.cmp-tabs-option:visible').getByText('Anulaciones y notas de crédito', { exact: true }).first(),

    /** Pestaña "Items vendidos" dentro de cierre de caja */
    tabItemsVendidos: (page: Page) =>
        page.getByText('Items vendidos', { exact: true }).nth(1),

    /** Pestaña "Descuentos" dentro de cierre de caja */
    tabDescuentos: (page: Page) =>
        page.getByText('Descuentos', { exact: true }).nth(1),

    /** Pestaña "Resumen de caja" (para acceder a Descargar) */
    tabResumenCaja: (page: Page) =>
        page.getByText('Resumen de caja', { exact: true }).nth(1),

    /** Botón "Descargar" en el resumen de caja */
    btnDescargar: (page: Page) =>
        page.getByText('Descargar', { exact: true }),

    /** Opción "Descargar Excel" en el dropdown */
    opcionDescargarExcel: (page: Page) =>
        page.getByText('Descargar Excel', { exact: true }),

    /** Opción "Descargar PDF" en el dropdown */
    opcionDescargarPDF: (page: Page) =>
        page.getByRole('listitem').filter({ hasText: 'Descargar PDF' }),

    /** Cerrar panel lateral/drape abierto */
    btnCerrarDrape: (page: Page) =>
        page.locator('.drape.is-open > .button-close > .icon'),
};
