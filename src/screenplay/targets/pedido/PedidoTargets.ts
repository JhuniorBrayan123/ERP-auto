import type {Page} from '@playwright/test';

/**
 * Targets específicos de Pedido en Vista Facturación.
 * Los selectores de grilla, buscador de producto y cliente se reutilizan
 * de VentaGridTargets y FacturacionTargets respectivamente.
 */
export const PedidoTargets = {

    // ─── Serie / Correlativo (búsqueda) ────────────────────────────
    inputCorrelativo: (page: Page) =>
        page.locator('[id*="cmp-pedido_cmp-pedido-header"][id*="v-input:correlativo"]'),

    btnBuscar: (page: Page) =>
        page.getByRole('button', {name: 'Buscar'}),

    // ─── Observaciones ─────────────────────────────────────────────
    inputObservaciones: (page: Page) =>
        page.getByRole('textbox', {name: 'Ingresa tus observaciones'}),

    // ─── Cliente sin documento ─────────────────────────────────────
    /** Label que envuelve el switch "sin documento". Clickear el label togglea el checkbox correctamente en Vue */
    switchClienteSinDoc: (page: Page) =>
        page.locator('label:has(> input[id*="sin-documento"])'),

    inputRazonSocialSinDoc: (page: Page) =>
        page.locator('[id*="cmp-pedido-header"][id*="v-input:razon-social-sin-documento"]'),

    inputDireccionSinDoc: (page: Page) =>
        page.locator('[id*="cmp-pedido-header"][id*="v-input:direccion-sin-documento"]'),

    btnEmitir: (page: Page) =>
        page.getByRole('button', {name: 'EMITIR'}),

    btnGuardarPedido: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_v-button:pago-rapido"]'),
    btnGuardarPedidoFactura: (page: Page) =>
        page.locator('[id="pv_cmp-facturacion_cmp-pedido_cmp-nc-body_cmp-pedido-totales_v-button:guardar"]'),

    btnActualizarPedido: (page: Page) =>
        page.getByRole('button', {name: 'ACTUALIZAR PEDIDO'}),
    btnVerTodos: (page: Page) =>
        page.getByRole('button', {name: /ver todos/i}),

    pillPedidos: (page: Page) =>
        page.locator('[id="pv_comprobantes_cmp-header-comprobantes_categorias:pill-PEDIDOS"]'),

    mensajeSinItems: (page: Page) =>
        page.getByText('No puedes realizar un pago porque no tienes ítems seleccionados'),
};
