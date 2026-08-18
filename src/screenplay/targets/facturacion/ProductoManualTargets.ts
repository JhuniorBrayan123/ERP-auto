import type {Page} from '@playwright/test';

export const ProductoManualTargets = {

    btnProductoManual: (page: Page) =>
        page.getByRole('button', {name: /producto manual/i}),

    textareaNombre: (page: Page) =>
        page.locator('[id="pv_punto-venta_drapes:producto-manual_v-textarea:nombre-producto"]'),

    inputCantidad: (page: Page) =>
        page.locator('[id="pv_punto-venta_drapes:producto-manual_v-input:cantidad"]'),

    inputPrecioBase: (page: Page) =>
        page.locator('[id="pv_punto-venta_drapes:producto-manual_v-input:precio-base"]'),

    inputPrecioFinal: (page: Page) =>
        page.locator('[id="pv_punto-venta_drapes:producto-manual_v-input:precio-final"]'),

    checkboxGuardar: (page: Page) =>
        page.locator('[id="pv_punto-venta_drapes:producto-manual_v-checkbox:guardar-producto"]'),

    btnAgregarProducto: (page: Page) =>
        page.locator('[id="pv_punto-venta_drapes:producto-manual_v-button:aceptar"]'),

    btnCancelar: (page: Page) =>
        page.getByRole('button', {name: 'Cancelar'}),

    campoObligatorioError: (page: Page) =>
        page.getByText('Campo obligatorio'),
};
