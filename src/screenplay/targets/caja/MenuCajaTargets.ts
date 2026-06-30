import type { Page } from '@playwright/test';

// ─── Menú lateral de caja ────────────────────────────────────────────────────

export const MenuCajaTargets = {
    /** Ícono/botón que abre el menú lateral de caja */
    btnAbrirMenu: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-pv-navbar:navbar_menu-icon"]'),

    /** Opción "Ingreso de dinero" en el menú */
    opcionIngresoDinero: (page: Page) =>
        page.locator('[id="pv_cmp-punto-venta_menus:menu-movimientos-dinero:li_ingreso-dinero"]'),

    /** Opción "Egreso de dinero" en el menú */
    opcionEgresoDinero: (page: Page) =>
        page.locator('[id="pv_cmp-punto-venta_menus:menu-movimientos-dinero:li_egreso-dinero"]'),

    /** Opción "Pagos" en el menú */
    opcionPagos: (page: Page) =>
        page.locator('[id="pv_cmp-punto-venta_menus:menu-movimientos-dinero:li_pagos"]'),

    /** Opción "Cobros" en el menú */
    opcionCobros: (page: Page) =>
        page.locator('[id="pv_cmp-punto-venta_menus:menu-movimientos-dinero:li_cobros"]'),

    /** Opción "Cierre de caja" en el menú */
    opcionCierreCaja: (page: Page) =>
        page.getByRole('listitem').filter({ hasText: /^Cierre de caja$/ }),

    /** Opción "Nueva venta" en el menú (para regresar al carrito) */
    opcionNuevaVenta: (page: Page) =>
        page.getByText('Nueva venta', { exact: true }),

    /** Opción "Anular comprobante" en el menú */
    opcionAnularComprobante: (page: Page) =>
        page.getByText('Anular comprobante', { exact: true }),

    /** Cerrar el menú lateral (ícono de cierre) */
    btnCerrarMenu: (page: Page) =>
        page.locator('.menu-header > .menu-icon'),

    /** Botón "Continuar vendiendo" en la tarjeta de caja */
    btnContinuarVendiendo: (page: Page) =>
        page.getByRole('button', { name: 'Continuar vendiendo' }).first(),
};
