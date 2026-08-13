import type {Page} from '@playwright/test';

export const PagoTargets = {

    btnPagar: (page: Page) =>
        page.getByRole('button', {name: 'PAGAR', exact: true}),

    
    selectorTipoDocPago: (page: Page) =>
        page.locator('.cmp-confirmar-pago .v-select-base-header').filter({hasText: /^BOLETA$/}).first(),

    opcionTipoDocPago: (page: Page, tipo: string) =>
        page.locator('.cmp-confirmar-pago .v-select-base-options.is-open .v-select-form-option').getByText(tipo, {exact: true}),

    btnConfirmarPago: (page: Page) =>
        page.getByRole('button', {name: 'Confirmar'}),

    btnMontoExacto: (page: Page) =>
        page.locator('[id="pv_ventas_cmp-punto-venta_v-modal:cmp-realizar-pago:cmp-metodos-pago_v-button:monto-exacto"]'),

    btnRealizarPago: (page: Page) =>
        page.locator('[id="pv_ventas_cmp-punto-venta_v-modal:cmp-realizar-pago_v-button:cmp-realizar-pago"]'),

    btnMetodoPago: (page: Page, nombre: string) =>
        
        
        page.locator('.cmp-metodos-pago .v-button-item-type').filter({hasText: new RegExp(`^${nombre}$`, 'i')}),

    inputTipoCambio: (page: Page) =>
        page.getByRole('textbox', {name: '0'})
            .or(page.getByRole('textbox', {name: 'Cambio'})),
};
