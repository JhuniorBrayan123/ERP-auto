import type { Page } from '@playwright/test';



export const CobrosPagosTargets = {
        inputBuscarSerieCorrelativo: (page: Page) =>
        page.getByRole('textbox', { name: /Buscar serie o correlativo/i }),

    

        selectorEstadoCobro: (page: Page) =>
        page.locator('div').filter({ hasText: /^Todos$/ }).nth(3),

        opcionCobroPendiente: (page: Page) =>
        page.getByText('COBRO PENDIENTE').first(),

        selectorTipoComprobanteCobro: (page: Page) =>
        
        page.locator('.v-multiselect-form-header').filter({ hasText: 'Todos' }).first(),

        checkboxTipoComprobanteTodos: (page: Page) =>
        page.locator('[id="pv_cmp-pagos-cobros_cmp-filtros-pagos-cobros_v-multiselect:cliente-cobros_v-checkbox:todos"]'),

        checkboxTipoComprobanteOpcion: (page: Page, tipoId: '1003' | '1004' | '1006' | '2016') =>
        page.locator(`[id="pv_cmp-pagos-cobros_cmp-filtros-pagos-cobros_v-multiselect:cliente-cobros_v-checkbox:${tipoId}"]`),

        btnBuscarCobros: (page: Page) =>
        page.getByRole('button', { name: /^Buscar$/i }),

        btnCobrarFila: (page: Page) =>
        page.locator('[id="pv_cmp-pagos-cobros_v-body:cmp-pc-body_cmp-grid-pagos-cobros_v-button:options"]').first(),

        inputMontoCobro: (page: Page) =>
        page.getByRole('textbox', { name: /Digita el monto/i }),

        btnAceptarCobro: (page: Page) =>
        page.getByRole('button', { name: /Aceptar/i }),

        toastCobroExitoso: (page: Page) =>
        page.getByText(/¡Buen Trabajo!/i),

        opcionVerCobro: (page: Page) =>
        page.getByText('Ver cobro', { exact: true }),

        textoMontoAdeudado: (page: Page) =>
        page.getByText(/Monto adeudado: S\/ 0\.00/i),

    

        selectorEstadoPago: (page: Page) =>
        page.locator('div').filter({ hasText: /^Todos$/ }).nth(3),

        opcionPagoPendiente: (page: Page) =>
        page.getByText('PAGO PENDIENTE').first(),

        btnPagar: (page: Page) =>
        page.getByRole('button', { name: /^PAGAR$/i }),

        btnCobrar: (page: Page) =>
        page.getByRole('button', { name: /^COBRAR$/i }),

        btnAgregarCuota: (page: Page) =>
        page.getByRole('button', { name: /Agregar cuota/i }),

        btnGuardarCuota: (page: Page) =>
        page.getByRole('button', { name: /^Guardar$/i }),

        inputMontoPago: (page: Page) =>
        page.getByRole('textbox', { name: /Digita el monto/i }),

        btnAceptarPago: (page: Page) =>
        page.getByRole('button', { name: /Aceptar/i }),

        toastPagoExitoso: (page: Page) =>
        page.getByText(/¡Buen Trabajo!/i),

        opcionVerPago: (page: Page) =>
        page.getByText('Ver pago', { exact: true }),

        btnCerrarDrape: (page: Page) =>
        page.locator('.drape.is-open > .button-close'),
};
