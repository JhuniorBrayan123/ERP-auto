import type { Page } from '@playwright/test';



export const MenuCajaTargets = {
        btnAbrirMenu: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-pv-navbar:navbar_menu-icon"]'),

        opcionIngresoDinero: (page: Page) =>
        page.locator('[id="pv_cmp-punto-venta_menus:menu-movimientos-dinero:li_ingreso-dinero"]'),

        opcionEgresoDinero: (page: Page) =>
        page.locator('[id="pv_cmp-punto-venta_menus:menu-movimientos-dinero:li_egreso-dinero"]'),

        opcionPagos: (page: Page) =>
        page.locator('[id="pv_cmp-punto-venta_menus:menu-movimientos-dinero:li_pagos"]'),

        opcionCobros: (page: Page) =>
        page.locator('[id="pv_cmp-punto-venta_menus:menu-movimientos-dinero:li_cobros"]'),

        opcionCierreCaja: (page: Page) =>
        page.getByRole('listitem').filter({ hasText: /^Cierre de caja$/ }),

        opcionNuevaVenta: (page: Page) =>
        page.getByText('Nueva venta', { exact: true }),

        opcionAnularComprobante: (page: Page) =>
        page.getByText('Anular comprobante', { exact: true }),

        btnCerrarMenu: (page: Page) =>
        page.locator('.menu-header > .menu-icon'),

        btnContinuarVendiendo: (page: Page) =>
        page.getByRole('button', { name: 'Continuar vendiendo' }).first(),
};
