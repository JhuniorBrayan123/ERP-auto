import type {Page} from '@playwright/test';

export const CotizacionTargets = {

    
    selectorSerie: (page: Page) =>
        page.locator('.v-select-header-form > .text').first(),

    primerOpcionSerie: (page: Page) =>
        page.locator('.v-select-form-option').first(),

    inputCorrelativo: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-cotizacion_cmp-cotizacion-header:header_v-input:correlativo"]'),

    btnBuscar: (page: Page) =>
        page.getByRole('button', {name: 'Buscar'}),

    
    selectorVigencia: (page: Page) =>
        page.locator('.v-select-base-header').filter({hasText: /^\d+ días?$/}).first(),

    opcionVigencia: (page: Page, dias: string) =>
        page.locator('.v-select-base-options.is-open .v-select-form-option').getByText(dias, {exact: true}),

    
    selectorIGV: (page: Page) =>
        page.locator('.v-select-base-header').filter({hasText: /^\d+\.?\d*%$/}).first(),

    opcionIGV: (page: Page, porcentaje: string) =>
        page.locator('.v-select-base-options.is-open .v-select-form-option').getByText(porcentaje, {exact: true}),

    switchClienteSinDoc: (page: Page) =>
        page.locator('label:has(> input[id*="sin-documento"]) > .slider'),

    inputRazonSocialSinDoc: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-cotizacion-header_v-input:razon-social-sin-documento"]'),

    inputDireccionSinDoc: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-cotizacion-header_v-input:direccion-sin-documento"]'),

    switchIncluirImagenes: (page: Page) =>
        page.locator('.advance-doc > .switch-component > .v-switch > .switch-content > .switch > .slider').first(),

    switchIncluirDescripcion: (page: Page) =>
        page.locator('.right > div:nth-child(3) > .switch-component > .v-switch > .switch-content > .switch > .slider'),

    inputObservaciones: (page: Page) =>
        page.getByRole('textbox', {name: 'Ingresa tus observaciones'}),

    
    btnEmitir: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_v-button:pago-rapido"]'),

    btnEmitirVF: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-cotizacion-body_v-button:pago-rapido"]'),

    btnActualizarCotizacion: (page: Page) =>
        page.getByRole('button', {name: 'ACTUALIZAR COTIZACIÓN'}),

    btnPagarCotizacion: (page: Page) =>
        page.getByRole('button', {name: 'PAGAR COTIZ.'}),

    
    selectorTipoDocPago: (page: Page) =>
        page.locator('.cmp-confirmar-pago .v-select-base-header').filter({hasText: /^BOLETA$/}).first(),

    opcionTipoDocPago: (page: Page, tipo: string) =>
        page.locator('.cmp-confirmar-pago .v-select-base-options.is-open .v-select-form-option').getByText(tipo, {exact: true}),

    btnConfirmarPago: (page: Page) =>
        page.getByRole('button', {name: 'Confirmar'}),

    
    gridCotizacion: (page: Page) =>
        page.locator('[id*="cmp-cotizacion-grid"]'),

    btnIncrementarCantidad: (page: Page, indice: number = 0) =>
        page.locator(`[id="pv_cmp-cotizacion-grid_cmp-cotizacion-grid-body:grilla_v-step:cantidad-item-${indice}_div:increase"]`),

    
    pillCotizaciones: (page: Page) =>
        page.locator('[id="pv_comprobantes_cmp-header-comprobantes_categorias:pill-COTIZACIONES"]'),

    
    mensajeNoEncontrado: (page: Page) =>
        page.getByText('No se encontró el comprobante con los datos ingresados. Por favor, verifica e intenta nuevamente.'),

    mensajeSinItems: (page: Page) =>
        page.getByText('No puedes realizar esta operación porque no tienes ítems seleccionados'),
};
