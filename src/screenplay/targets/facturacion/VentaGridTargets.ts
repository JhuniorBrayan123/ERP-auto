import type {Page} from '@playwright/test';

export const VentaGridTargets = {

    inputBuscarProducto: (page: Page) =>
        page.getByRole('textbox', {name: 'Escanea o busca por nombre, c'}),

    tablaGrilla: (page: Page) =>
        page.getByRole('table'),

    filaItem: (page: Page, indice: number = 0) =>
        page.getByRole('row').nth(indice + 1), 

    btnEditarItem: (page: Page, indice: number = 0) =>
        page.locator(`[id="pv_cmp-factura-boleta-grid_cmp-factura-boleta-grid-body:grilla_v-icon:editar-item-${indice}"] > .icon`),

    btnEliminarItem: (page: Page, indice: number = 0) =>
        page.locator(`[id="pv_cmp-factura-boleta-grid_cmp-factura-boleta-grid-body:grilla_v-icon:eliminar-item-${indice}"] > .icon`),

    btnAceptarEdicion: (page: Page, indice: number = 0) =>
        page.locator(`[id="pv_cmp-factura-boleta-grid_cmp-factura-boleta-grid-body:grilla_dv:aceptar-editar-${indice}"]`),

    inputPrecioFinal: (page: Page, indice: number = 0) =>
        page.locator(`[id="pv_cmp-factura-boleta-grid_cmp-factura-boleta-grid-body:grilla_v-input:precio-final-${indice}"]`),

    inputDescuento: (page: Page, indice: number = 0) =>
        page.locator(`[id="pv_cmp-factura-boleta-grid_cmp-factura-boleta-grid-body:grilla_v-input:descuento-${indice}"]`),

    inputCantidad: (page: Page, indice: number = 0) =>
        page.locator(`[id="pv_cmp-factura-boleta-grid_cmp-factura-boleta-grid-body:grilla_v-step:cantidad-item-${indice}"] input`),

    btnIncrementarCantidad: (page: Page, indice: number = 0) =>
        page.locator(`[id="pv_cmp-factura-boleta-grid_cmp-factura-boleta-grid-body:grilla_v-step:cantidad-item-${indice}_div:increase"]`),

    
        btnDetalles: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_v-icon:detalles"]'),

        btnTotales: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_v-icon:totales"]'),

        inputDescuentoGlobal: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_cmp-descuento-pedido_v-input:valor"]'),

    btnAplicarDescuento: (page: Page) =>
        page.getByRole('button', {name: 'Aplicar descuento'}),

    
    btnPagar: (page: Page) =>
        page.getByRole('button', {name: 'PAGAR'}),

    btnPrecuenta: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-factura-boleta-body_v-button:precuenta"]')
            .or(page.getByText('PRECUENTA', {exact: true})),

    btnVistaPrevia: (page: Page) =>
        page.getByRole('button', {name: 'VISTA PREVIA'}),

    btnDatosOpcionales: (page: Page) =>
        page.getByRole('button', {name: 'Datos opcionales'}),

    btnCerrarDrape: (page: Page) =>
        page.locator('.drape.is-open > .button-close').first(),

    btnCerrarVistaPrevia: (page: Page) =>
        page.locator('.icon-close'),
};
