import type {Page} from '@playwright/test';

/**
 * Targets específicos de Cotización en Vista Facturación.
 * Extraídos del codegen facturacion_2da_parte.spec.ts.
 */
export const CotizacionTargets = {

    // ─── Serie / Correlativo (búsqueda) ────────────────────────────
    selectorSerie: (page: Page) =>
        page.locator('.v-select-header-form > .text').first(),

    primerOpcionSerie: (page: Page) =>
        page.locator('.v-select-form-option').first(),

    inputCorrelativo: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-cotizacion_cmp-cotizacion-header:header_v-input:correlativo"]'),

    btnBuscar: (page: Page) =>
        page.getByRole('button', {name: 'Buscar'}),

    // ─── Vigencia de oferta ────────────────────────────────────────
    selectorVigencia: (page: Page) =>
        page.locator('div').filter({hasText: /^0 días$/}).nth(3),

    opcionVigencia: (page: Page, dias: string) =>
        page.getByText(dias, {exact: true}),

    // ─── IGV ───────────────────────────────────────────────────────
    selectorIGV: (page: Page) =>
        page.locator('div').filter({hasText: /^18%$/}).nth(3),

    opcionIGV: (page: Page, porcentaje: string) =>
        page.getByText(porcentaje),

    switchClienteSinDoc: (page: Page) =>
        page.locator('label:has(> input[id*="sin-documento"]) > .slider'),

    inputRazonSocialSinDoc: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-cotizacion-header_v-input:razon-social-sin-documento"]'),

    inputDireccionSinDoc: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-cotizacion-header_v-input:direccion-sin-documento"]'),

    // ─── Imágenes / Descripción ────────────────────────────────────
    switchIncluirImagenes: (page: Page) =>
        page.locator('.advance-doc > .switch-component > .v-switch > .switch-content > .switch > .slider').first(),

    switchIncluirDescripcion: (page: Page) =>
        page.locator('.right > div:nth-child(3) > .switch-component > .v-switch > .switch-content > .switch > .slider'),

    // ─── Observaciones ─────────────────────────────────────────────
    inputObservaciones: (page: Page) =>
        page.getByRole('textbox', {name: 'Ingresa tus observaciones'}),

    // ─── Acciones ──────────────────────────────────────────────────
    btnEmitir: (page: Page) =>
        page.getByRole('button', {name: 'EMITIR'}),

    btnActualizarCotizacion: (page: Page) =>
        page.getByRole('button', {name: 'ACTUALIZAR COTIZACIÓN'}),

    btnPagarCotizacion: (page: Page) =>
        page.getByRole('button', {name: 'PAGAR COTIZ.'}),

    // ─── Pagar cotización — modal selección tipo doc ───────────────
    selectorTipoDocPago: (page: Page) =>
        page.locator('div').filter({hasText: /^BOLETA$/}).nth(4),

    opcionTipoDocPago: (page: Page, tipo: string) =>
        page.getByText(tipo).nth(2),

    btnConfirmarPago: (page: Page) =>
        page.getByRole('button', {name: 'Confirmar'}),

    // ─── Grilla cotización ─────────────────────────────────────────
    gridCotizacion: (page: Page) =>
        page.locator('[id*="cmp-cotizacion-grid"]'),

    btnIncrementarCantidad: (page: Page, indice: number = 0) =>
        page.locator(`[id="pv_cmp-cotizacion-grid_cmp-cotizacion-grid-body:grilla_v-step:cantidad-item-${indice}_div:increase"]`),

    // ─── Búsqueda de comprobantes (pill) ───────────────────────────
    pillCotizaciones: (page: Page) =>
        page.locator('[id="pv_comprobantes_cmp-header-comprobantes_categorias:pill-COTIZACIONES"]'),

    // ─── Mensajes de validación ────────────────────────────────────
    mensajeNoEncontrado: (page: Page) =>
        page.getByText('No se encontró el comprobante con los datos ingresados. Por favor, verifica e intenta nuevamente.'),

    mensajeSinItems: (page: Page) =>
        page.getByText('No puedes realizar un pago porque no tienes ítems seleccionados'),
};
