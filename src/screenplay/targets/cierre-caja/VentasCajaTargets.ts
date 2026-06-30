import type { Page } from '@playwright/test';

// ─── Targets de la pestaña "Ventas" en Cierre de Caja ────────────────────────

export const VentasCajaTargets = {
    /** Botón "Ver Filtros Avanzados" en la pestaña Ventas */
    btnFiltrosAvanzados: (page: Page) =>
        page.getByRole('button', { name: /Ver Filtros Avanzados/i }),

    /** Botón "Borrar filtros" */
    btnBorrarFiltros: (page: Page) =>
        page.getByRole('button', { name: /Borrar filtros/i }),

    /** Selector de "Tipo de documento" en filtros avanzados */
    selectorTipoDocumento: (page: Page) =>
        page.getByText('Tipo de documento', { exact: true }),

    /** Opción Boleta en el dropdown de tipo de documento */
    opcionBoleta: (page: Page) =>
        page.getByText('Boleta', { exact: true }),

    /** Opción Factura en el dropdown de tipo de documento */
    opcionFactura: (page: Page) =>
        page.getByText('Factura', { exact: true }),

    /** Opción "Nota de Débito" en el dropdown de tipo de documento */
    opcionNotaDebito: (page: Page) =>
        page.getByText('Nota de Débito', { exact: true }),

    /** Opción "Nota de Venta" en el dropdown de tipo de documento */
    opcionNotaVenta: (page: Page) =>
        page.getByText('Nota de Venta', { exact: true }),

    /** Selector de Serie (encabezado de columna en filtros) */
    selectorSerie: (page: Page) =>
        page.getByText('Serie', { exact: true }),

    /** Input de Correlativo en filtros avanzados */
    inputCorrelativo: (page: Page) =>
        page.getByRole('textbox', { name: 'Correlativo', exact: true }),

    /** Selector de Estado en filtros avanzados */
    selectorEstado: (page: Page) =>
        page.getByText('Estado', { exact: true }),

    /** Botón de acciones de la primera fila de la grilla (row-0) */
    btnAccionesFila: (page: Page, rowIndex: number = 0) =>
        page.locator(`[id="pv_cierre-caja_cmp-sales-grid-body:row-${rowIndex}:options"]`),

    /** Opción "Ver Pago" en el menú de acciones de comprobante */
    opcionVerPago: (page: Page) =>
        page.getByText('Ver Pago', { exact: true }),

    /** Opción "Ver Bitácora" en el menú de acciones */
    opcionVerBitacora: (page: Page) =>
        page.getByText('Ver Bitácora', { exact: true }),

    /** Opción "Nota de crédito" en el menú de acciones */
    opcionNotaCredito: (page: Page) =>
        page.locator(
            '[id*="nota-credito"]',
        ).filter({ hasText: /Nota de crédito/i }),

    /** Opción "Anular documento" en el menú de acciones */
    opcionAnularDocumento: (page: Page) =>
        page.locator('[id*="anular-comprobante"]').filter({ hasText: /Anular documento/i }),

    /** Opción "Ver documento" en el menú de acciones */
    opcionVerDocumento: (page: Page) =>
        page.locator('[id*="ver-comprobante"]').filter({ hasText: /Ver documento/i }),

    /** Opción "Clonar documento" en el menú de acciones */
    opcionClonarDocumento: (page: Page) =>
        page.locator('[id*="clonar-comprobante"]').filter({ hasText: /Clonar documento/i }),

    /** Texto de totales de monto en la pestaña Ventas */
    textoTotalMonto: (page: Page) =>
        page.getByText(/Total monto:/i),

    /** Texto de totales de monto pagado en la pestaña Ventas */
    textoTotalMontoPagado: (page: Page) =>
        page.getByText(/Total monto pagado:/i),

    /** Modal de Ver Pago — título con número de documento */
    modalVerPagoTitulo: (page: Page) =>
        page.locator('.v-modal').filter({ hasText: /Método de pago/i }),

    /** Overlay para cerrar modal de Ver Pago */
    overlayModal: (page: Page) =>
        page.locator('.v-modal > div').first(),
};
