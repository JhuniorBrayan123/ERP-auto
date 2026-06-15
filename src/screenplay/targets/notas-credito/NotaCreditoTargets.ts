import type {Page} from '@playwright/test';

export const NotaCreditoTargets = {
    btnEmitirSinReferencia: (page: Page) =>
        page.getByRole('button', {name: /emitir nota sin referencia/i}),

    inputSerieReferencia: (page: Page) =>
        page.locator(
            '[id="pv_punto-venta_cmp-nota-credito_cmp-header:header_.cmp-nc-datos-doc-referencia_v-input:serie"]'
        ),

    inputCorrelativoReferencia: (page: Page) =>
        page.locator(
            '[id="pv_punto-venta_cmp-nota-credito_cmp-header:header_.cmp-nc-datos-doc-referencia_v-input:correlativo"]'
        ),

    inputBusquedaClienteSinRef: (page: Page) =>
        page.getByRole('textbox', { name: 'Digita RUC o razón social' }),

    inputBusquedaItemSinRef: (page: Page) =>
        page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }),


    selectorTipoNota: (page: Page) =>
        page.locator('div').filter({hasText: /^Anulación de la operación$/}).nth(3),

    opcionAnulacion: (page: Page) =>
        page.getByText('Anulación de la operación').nth(1),

    opcionAnulacionPorErrorRUC: (page: Page) =>
        page.getByText('Anulación por error en el RUC'),

    opcionDevolucionTotal: (page: Page) =>
        page.getByText('Devolución Total'),

    opcionDevolucionPorItem: (page: Page) =>
        page.getByText('Devolución por ítem'),

    opcionDescuentoGlobal: (page: Page) =>
        page.getByText('Descuento global'),

    opcionDescuentoPorItem: (page: Page) =>
        page.getByText('Descuento por ítem'),

    opcionCorreccionDescripcion: (page: Page) =>
        page.getByText('Corrección por error en la descripción'),

    opcionBonificacion: (page: Page) =>
        page.getByText('Bonificación'),

    opcionDisminucionEnElValor: (page: Page) =>
        page.getByText('Disminución en el valor'),

    opcionOtrosConceptos: (page: Page) =>
        page.getByText('Otros Conceptos'),
    opcionAjustesExportacion: (page: Page) =>
        page.getByText('Ajustes de operaciones de exportación'),
    inputMonto: (page: Page) =>
        page.getByRole('textbox', {name: '0.00'}),

    switchRetornoStock: (page: Page) =>
        page.locator('.retorno > div > .v-switch > .switch-content > .switch > .slider'),
    inputMotivo: (page: Page) =>
        page.getByRole('textbox', {name: /digita el motivo de la nota/i}),


    gridItems: (page: Page) =>
        page.locator(
            '[id="pv_cmp-nota-credito_cmp-nc-body_cmp-observaciones-totales_v-button:vista-previa_v-grid:body-grilla"]'
        ),

    btnEditarItem: (page: Page) =>
        page.locator(
            '[id="pv_cmp-nota-credito:nota-credito_cmp_nc_body_cmp-items-comprobante:body_v-grid:body-grilla_div:btn-editar-item"]'
        ),

    btnAceptarItem: (page: Page) =>
        page.locator(
            '[id="pv_cmp-nota-credito:nota-credito_cmp_nc_body_cmp-items-comprobante:body_v-grid:body-grilla_div:btn-aceptar-item"]'
        ),

    btnEditarItemComprobante: (page: Page) =>
        page.locator(
            '[id="pv_cmp-nota-credito:nota-credito_cmp_nc_body_cmp-items-comprobante:body_v-grid:body-grilla_div:btn-editar-item"]'
        ),

    btnAceptarItemComprobante: (page: Page) =>
        page.locator(
            '[id="pv_cmp-nota-credito:nota-credito_cmp_nc_body_cmp-items-comprobante:body_v-grid:body-grilla_div:btn-aceptar-item"]'
        ),

    btnEditarItemCorreccionDescripcion: (page: Page) =>
        page.locator(
            '[id="pv_cmp-nota-credito_cmp-nc-body_cmp-observaciones-totales_v-button:vista-previa_v-grid:body-grilla_div:btn-editar-item"]'
        ),

    btnAceptarItemCorreccionDescripcion: (page: Page) =>
        page.locator(
            '[id="pv_cmp-nota-credito_cmp-nc-body_cmp-observaciones-totales_v-button:vista-previa_v-grid:body-grilla_div:btn-aceptar-item"]'
        ),

    inputDescuentoPorItem: (page: Page) =>
        page.locator(
            '[id="pv_cmp-nota-credito:nota-credito_cmp_nc_body_cmp-items-comprobante:body_v-grid:body-grilla_v-input:descuento"]'
        ),

    inputCantidadBonificar: (page: Page) =>
        page.locator(
            '[id="pv_cmp-nota-credito:nota-credito_cmp_nc_body_cmp-items-comprobante:body_v-grid:body-grilla_v-input:precio"]'
        ),

    inputPrecioDeItem: (page: Page) =>
        page.locator('[id="pv_cmp-nota-credito:nota-credito_cmp_nc_body_cmp-items-comprobante:body_v-grid:body-grilla_v-input:precio"]'),

    inputCantidadDevolver: (page: Page) =>
        page.locator(
            '[id="pv_cmp-nota-credito:nota-credito_cmp_nc_body_cmp-items-comprobante:body_v-grid:body-grilla_v-input:cantidad"]'
        ),

    inputNuevaDescripcion: (page: Page) =>
        page.locator(
            '[id="pv_cmp-nota-credito:nota-credito_cmp_nc_body_cmp-items-comprobante:body_v-grid:body-grilla_v-input:nombre"]'
        ),

    btnEmitir: (page: Page) =>
        page.getByRole('button', {name: /^Emitir$/i}),
    btnRealizarDevolucionYEmitir: (page: Page) =>
        page.getByRole('button', {name: /realizar devolución y emitir/i}),

    selectorFacturaSinRef: (page: Page) =>
        page.locator('div').filter({hasText: /^Factura$/}).nth(3),

    opcionFacturaSinRef: (page: Page) =>
        page.locator('div').filter({hasText: /^Factura$/}).nth(4),
};
