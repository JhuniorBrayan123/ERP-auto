import type {Page} from '@playwright/test';

const TIPO_COMPROBANTE_ID: Record<string, number> = {
    'BOLETA': 1004,
    'FACTURA': 1003,
    'NOTA DE VENTA': 2016,
    'COTIZACION': 3007,
    'PEDIDO': 2011,
};

export const FacturacionTargets = {


    iconoVistaFacturacionActivo: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-pv-navbar:navbar_cmp-select:vista_grilla_option:vista_facturacion"] .icon-grid.billing.active'),

    opcionVistaFacturacion: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-pv-navbar:navbar_cmp-select:vista_grilla_option:vista_facturacion"]'),

    btnCambiarVista: (page: Page) =>
        page.getByText('CAMBIAR VISTA'),

    btnGuardarVista: (page: Page) =>
        page.getByRole('button', {name: 'Guardar vista'}).nth(1),

    opcionVistaCuadrada: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-pv-navbar:navbar_cmp-select:vista_grilla_option:vista_imagen_cuadrada"]'),


    opcionTipoComprobante: (page: Page, tipo: string) => {
        const id = TIPO_COMPROBANTE_ID[tipo] ?? TIPO_COMPROBANTE_ID['BOLETA'];
        return page.locator(
            `[id="pv_punto-venta_cmp-factura-boleta-header_v-select:tipo-comprobante_v-option:opcion-${id}"]`
        );
    },


    inputBuscarCliente: (page: Page) =>
        page.getByRole('textbox', {name: 'Digita RUC o razón social'}),


    inputAdelanto: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-factura-boleta-header_v-switch:documento-adelanto"]').first(),

    sliderAdelanto: (page: Page) =>
        page.locator('label:has([id$="_v-switch:documento-adelanto"])').first(),
    chkDetraccion: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-factura-boleta-header_v-switch:documento-detraccion"]'),
    sliderDetraccion: (page: Page) =>
        page.locator('label:has([id$="_v-switch:documento-detraccion"])').first(),

    sliderExportacion: (page: Page) =>
        page.locator('div:nth-child(4) > .switch-component > .v-switch > .switch-content > .switch > .slider'),

    sliderRetencion: (page: Page) =>
        page.locator('label:has([id$="_v-switch:documento-retencion"])').first(),

    btnEditarDetraccion: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-factura-boleta-header_div:editar-datos-detraccion"]'),
    chkRetencion: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-factura-boleta-header_v-switch:documento-retencion"]'),

    inputPorcentajeRetencion: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-factura-boleta-header_v-input:porcentaje"]'),

    btnGuardarRetencion: (page: Page) =>
        page.getByRole('button', {name: 'Guardar', exact: true}),


    btnNuevaVenta: (page: Page) =>
        page.getByRole('button', {name: 'Nueva Venta'}),

    btnContinuarVendiendo: (page: Page) =>
        page.getByRole('button', {name: 'Continuar vendiendo'}).first(),


    mensajeExito: (page: Page) =>
        page.getByText('¡Buen trabajo!'),

    mensajeVistaGuardada: (page: Page) =>
        page.getByText('La vista fue guardada exitosamente'),


    btnCerrarModal: (page: Page) =>
        page.locator('.v-modal > div').first(),

    btnAceptarDialog: (page: Page) =>
        page.getByRole('button', {name: 'Aceptar'}),


    btnMenuNavbar: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-pv-navbar:navbar_menu-icon"]'),
};
