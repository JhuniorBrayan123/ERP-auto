import type {Page} from '@playwright/test';

export const PagoTargets = {

    btnPagar: (page: Page) =>
        page.getByRole('button', {name: 'PAGAR', exact: true}),

    btnMontoExacto: (page: Page) =>
        page.locator('[id="pv_ventas_cmp-punto-venta_v-modal:cmp-realizar-pago:cmp-metodos-pago_v-button:monto-exacto"]'),

    btnRealizarPago: (page: Page) =>
        page.locator('[id="pv_ventas_cmp-punto-venta_v-modal:cmp-realizar-pago_v-button:cmp-realizar-pago"]'),

    btnMetodoPago: (page: Page, nombre: string) =>
        // Si no tenemos un ID claro para el método (porque son dinámicos como metodo-tarjeta-0), 
        // usamos la clase que los contiene y filtramos por texto
        page.locator('.cmp-metodos-pago .v-button-item-type').filter({hasText: new RegExp(`^${nombre}$`, 'i')}),

    inputTipoCambio: (page: Page) =>
        page.getByRole('textbox', {name: '0'})
            .or(page.getByRole('textbox', {name: 'Cambio'})),
};
