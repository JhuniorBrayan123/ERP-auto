import type {Page} from '@playwright/test';

export const PedidoTargets = {


    inputCorrelativo: (page: Page) =>
        page.locator('[id*="cmp-pedido_cmp-pedido-header"][id*="v-input:correlativo"]'),

    btnBuscar: (page: Page) =>
        page.getByRole('button', {name: 'Buscar'}),


    inputObservaciones: (page: Page) =>
        page.getByRole('textbox', {name: 'Ingresa tus observaciones'}),

    switchClienteSinDoc: (page: Page) =>
        page.locator('label:has(> input[id*="sin-documento"]) > .slider'),

    inputRazonSocialSinDoc: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-factura-boleta-header_v-input:razon-social-sin-documento"]'),

    inputDireccionSinDoc: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-factura-boleta-header_v-input:direccion-sin-documento"]'),

    btnEmitir: (page: Page) =>
        page.getByRole('button', {name: 'EMITIR'}),

    btnGuardarPedido: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_v-button:pago-rapido"]'),

    btnGuardarPedidoFactura: (page: Page) =>
        page.locator('[id="pv_cmp-facturacion_cmp-pedido_cmp-nc-body_cmp-pedido-totales_v-button:guardar"]'),

    btnActualizarPedido: (page: Page) =>
        page.getByRole('button', {name: 'ACTUALIZAR PEDIDO'}),

    btnPagarPedido: (page: Page) =>
        page.getByRole('button', {name: 'PAGAR PEDIDO'}),

    btnVerTodos: (page: Page) =>
        page.getByRole('button', {name: /ver todos/i}),

    pillPedidos: (page: Page) =>
        page.locator('[id="pv_comprobantes_cmp-header-comprobantes_categorias:pill-PEDIDOS"]'),

    mensajeSinItems: (page: Page) =>
        page.getByText('No puedes realizar esta operación porque no tienes ítems seleccionados'),
};
