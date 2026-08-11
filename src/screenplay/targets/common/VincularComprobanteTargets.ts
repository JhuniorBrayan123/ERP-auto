import type {Page} from '@playwright/test';

export const VincularComprobanteTargets = {
    btnVincularComprobante: (page: Page) =>
        page.getByRole('button', {name: /vincular comprobante/i}),

    selectorTipoDocumento: (page: Page) =>
        page.locator('div').filter({hasText: /^Selecciona serie$/}).nth(1),

    opcionFactura: (page: Page) =>
        page.getByRole('button', {name: /^Factura$/i}),

    opcionBoleta: (page: Page) =>
        page.getByRole('button', {name: /^Boleta$/i}),

    opcionTipoDocumento: (page: Page, tipoDocumento: string) =>
        page.getByRole('button', {name: new RegExp(`^${tipoDocumento}$`, 'i')}),

    inputCorrelativo: (page: Page) =>
        page.getByRole('textbox', {name: /ej\./i}),

    btnBuscar: (page: Page) =>
        page.getByRole('button', {name: /^Buscar$/i}),

    datosComprobanteCargado: (page: Page) =>
        page.getByText(/datos del comprobante a/i),

    btnVincularYCrearNC: (page: Page) =>
        page.locator('[id="pv_cmp-nota-credito_modals_cmp-vincular-comprobante_cmp-resumen-comprobante_v-button:vincular"]'),

    mensajeNoEncontrado: (page: Page) =>
        page.getByText(/no se encontró el comprobante con los datos ingresados/i),
};
