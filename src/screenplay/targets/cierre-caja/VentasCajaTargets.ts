import type { Page } from '@playwright/test';



export const VentasCajaTargets = {
        btnFiltrosAvanzados: (page: Page) =>
        page.getByRole('button', { name: /Ver Filtros Avanzados/i }),

        btnBorrarFiltros: (page: Page) =>
        page.getByRole('button', { name: /Borrar filtros/i }),

        selectorTipoDocumento: (page: Page) =>
        page.getByText('Tipo de documento', { exact: true }),

        opcionBoleta: (page: Page) =>
        page.getByText('Boleta', { exact: true }),

        opcionFactura: (page: Page) =>
        page.getByText('Factura', { exact: true }),

        opcionNotaDebito: (page: Page) =>
        page.getByText('Nota de Débito', { exact: true }),

        opcionNotaVenta: (page: Page) =>
        page.getByText('Nota de Venta', { exact: true }),

        selectorSerie: (page: Page) =>
        page.getByText('Serie', { exact: true }),

        inputCorrelativo: (page: Page) =>
        page.getByRole('textbox', { name: 'Correlativo', exact: true }),

        selectorEstado: (page: Page) =>
        page.getByText('Estado', { exact: true }),

        btnAccionesFila: (page: Page, rowIndex: number = 0) =>
        page.locator(`[id="pv_cierre-caja_cmp-sales-grid-body:row-${rowIndex}:options"]`),

        opcionVerPago: (page: Page) =>
        page.getByText('Ver Pago', { exact: true }),

        opcionVerBitacora: (page: Page) =>
        page.getByText('Ver Bitácora', { exact: true }),

        opcionNotaCredito: (page: Page) =>
        page.locator(
            '[id*="nota-credito"]',
        ).filter({ hasText: /Nota de crédito/i }),

        opcionAnularDocumento: (page: Page) =>
        page.locator('[id*="anular-comprobante"]').filter({ hasText: /Anular documento/i }),

        opcionVerDocumento: (page: Page) =>
        page.locator('[id*="ver-comprobante"]').filter({ hasText: /Ver documento/i }),

        opcionClonarDocumento: (page: Page) =>
        page.locator('[id*="clonar-comprobante"]').filter({ hasText: /Clonar documento/i }),

        textoTotalMonto: (page: Page) =>
        page.getByText(/Total monto:/i),

        textoTotalMontoPagado: (page: Page) =>
        page.getByText(/Total monto pagado:/i),

        modalVerPagoTitulo: (page: Page) =>
        page.locator('.v-modal').filter({ hasText: /Método de pago/i }),

        overlayModal: (page: Page) =>
        page.locator('.v-modal > div').first(),
};
