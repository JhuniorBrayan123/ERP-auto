import type { Page } from '@playwright/test';

// ─── Targets de la pestaña "Cobros y pagos" en Cierre de Caja ────────────────

export const CobrosPagosTargets = {
    /** Campo de búsqueda por serie o correlativo dentro de Cobros y pagos */
    inputBuscarSerieCorrelativo: (page: Page) =>
        page.getByRole('textbox', { name: /Buscar serie o correlativo/i }),

    // ── Módulo Cobros ────────────────────────────────────────────────────────

    /** Selector de estado de cobro (Todos / COBRO PENDIENTE / COBRADO) */
    selectorEstadoCobro: (page: Page) =>
        page.locator('div').filter({ hasText: /^Todos$/ }).nth(3),

    /** Opción "COBRO PENDIENTE" en el dropdown de estado */
    opcionCobroPendiente: (page: Page) =>
        page.getByText('COBRO PENDIENTE').first(),

    /** Selector de tipo de comprobante en Cobros (abre el multiselect) */
    selectorTipoComprobanteCobro: (page: Page) =>
        // Click en la cabecera del multiselect
        page.locator('.v-multiselect-form-header').filter({ hasText: 'Todos' }).first(),

    /** Opción "Todos" en el multiselect de Cobros (usado para desmarcar todos) */
    checkboxTipoComprobanteTodos: (page: Page) =>
        page.locator('[id="pv_cmp-pagos-cobros_cmp-filtros-pagos-cobros_v-multiselect:cliente-cobros_v-checkbox:todos"]'),

    /** Opciones de tipo de comprobante específicas en el multiselect */
    checkboxTipoComprobanteOpcion: (page: Page, tipoId: '1003' | '1004' | '1006' | '2016') =>
        page.locator(`[id="pv_cmp-pagos-cobros_cmp-filtros-pagos-cobros_v-multiselect:cliente-cobros_v-checkbox:${tipoId}"]`),

    /** Botón "Buscar" en Cobros */
    btnBuscarCobros: (page: Page) =>
        page.getByRole('button', { name: /^Buscar$/i }),

    /** Botón directo "COBRAR" de la primera fila de cobros (reemplaza a los tres puntitos) */
    btnCobrarFila: (page: Page) =>
        page.locator('[id="pv_cmp-pagos-cobros_v-body:cmp-pc-body_cmp-grid-pagos-cobros_v-button:options"]').first(),

    /** Input del monto en el modal de cobro */
    inputMontoCobro: (page: Page) =>
        page.getByRole('textbox', { name: /Digita el monto/i }),

    /** Botón "Aceptar" dentro del modal de cobro */
    btnAceptarCobro: (page: Page) =>
        page.getByRole('button', { name: /Aceptar/i }),

    /** Toast de cobro exitoso */
    toastCobroExitoso: (page: Page) =>
        page.getByText(/¡Buen Trabajo!/i),

    /** Opción "Ver cobro" en el dropdown de acciones de fila */
    opcionVerCobro: (page: Page) =>
        page.getByText('Ver cobro', { exact: true }),

    /** Texto de monto adeudado en el panel Ver cobro */
    textoMontoAdeudado: (page: Page) =>
        page.getByText(/Monto adeudado: S\/ 0\.00/i),

    // ── Módulo Pagos ─────────────────────────────────────────────────────────

    /** Selector de estado en Pagos */
    selectorEstadoPago: (page: Page) =>
        page.locator('div').filter({ hasText: /^Todos$/ }).nth(3),

    /** Opción "PAGO PENDIENTE" */
    opcionPagoPendiente: (page: Page) =>
        page.getByText('PAGO PENDIENTE').first(),

    /** Botón "PAGAR" en la fila de comprobante de compra */
    btnPagar: (page: Page) =>
        page.getByRole('button', { name: /^PAGAR$/i }),

    /** Botón "COBRAR" en la fila de comprobante de venta a crédito */
    btnCobrar: (page: Page) =>
        page.getByRole('button', { name: /^COBRAR$/i }),

    /** Botón "Agregar cuota" en el modal de pago */
    btnAgregarCuota: (page: Page) =>
        page.getByRole('button', { name: /Agregar cuota/i }),

    /** Botón "Guardar" cuota */
    btnGuardarCuota: (page: Page) =>
        page.getByRole('button', { name: /^Guardar$/i }),

    /** Input del monto en el modal de pago */
    inputMontoPago: (page: Page) =>
        page.getByRole('textbox', { name: /Digita el monto/i }),

    /** Botón "Aceptar" del modal de pago */
    btnAceptarPago: (page: Page) =>
        page.getByRole('button', { name: /Aceptar/i }),

    /** Toast de pago exitoso */
    toastPagoExitoso: (page: Page) =>
        page.getByText(/¡Buen Trabajo!/i),

    /** Opción "Ver pago" en dropdown de acciones de fila de pagos */
    opcionVerPago: (page: Page) =>
        page.getByText('Ver pago', { exact: true }),

    /** Cerrar el panel de "Ver cobro" o "Ver pago" */
    btnCerrarDrape: (page: Page) =>
        page.locator('.drape.is-open > .button-close'),
};
