import type {Page} from '@playwright/test';

export const PagoTargets = {

    btnMontoExacto: (page: Page) =>
        page.getByRole('button', {name: 'Monto exacto'}),

    btnRealizarPago: (page: Page) =>
        page.getByRole('button', {name: 'Realizar Pago'}),

    btnMetodoPago: (page: Page, nombre: string) =>
        page.getByRole('button', {name: nombre}),

    inputTipoCambio: (page: Page) =>
        page.getByRole('textbox', {name: '0'})
            .or(page.getByRole('textbox', {name: 'Cambio'})),
};
