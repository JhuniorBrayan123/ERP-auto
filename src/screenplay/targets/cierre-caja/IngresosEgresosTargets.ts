import type { Page } from '@playwright/test';



export const IngresosEgresosTargets = {
        inputBuscarSerieCorrelativo: (page: Page) =>
        page.locator('[id="pv_cmp-cierre-caja_cmp-sales-cierre_cmp-incomes-expenses-filtro:filtros_v-input:busqueda"]'),

        seccionIngresos: (page: Page) =>
        page.getByText(/Total Ingresos/i),

        seccionEgresos: (page: Page) =>
        page.getByText(/Total Egresos/i),

    

        inputMonto: (page: Page) =>
        page.locator('[id="pv_puntoventa_v-modal:cmp-ingreso-egreso-dinero_v-input:moneda"]'),

        inputMotivoIngreso: (page: Page) =>
        page.getByRole('textbox', { name: /Digita el motivo de tu ingreso/i }),

        inputMotivoEgreso: (page: Page) =>
        page.getByRole('textbox', { name: /Digita el motivo de tu egreso/i }),

        inputBuscarPersona: (page: Page) =>
        page.getByRole('textbox', { name: /Busca por nombre o documento/i }),

        dropdownResultadosPersona: (page: Page) =>
        page.locator('[id*="filtrar-entidad"]'),

        articulosResultadosPersona: (page: Page) =>
        page.locator('[id*="filtrar-entidad"] article'),

        btnRegistrarIngreso: (page: Page) =>
        page.getByRole('button', { name: /Registrar ingreso/i }),

        btnRegistrarEgreso: (page: Page) =>
        page.getByRole('button', { name: /Registrar egreso/i }),

        toastIngresoRegistrado: (page: Page) =>
        page.getByText(/Tu ingreso fue registrado/i),

        toastEgresoRegistrado: (page: Page) =>
        page.getByText(/¡Buen trabajo!/i),

        btnCerrarModal: (page: Page) =>
        page.getByRole('button', { name: /Cerrar/i }),

        textoNumeroRecibo: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-response-ingreso-egreso_v-button:imprimir-a4"]')
            .locator('xpath=ancestor::div[contains(@class,"modal")]')
            .getByText(/RC01-|RP01-/i),

        tarjetaResultado: (page: Page) =>
        page.locator('.v-card.handler-header'),

        iconoExpandirTarjetaResultado: (page: Page) =>
        page.locator('.v-card.handler-header .card-icon-handler'),

        cuerpoTarjetaResultado: (page: Page) =>
        page.locator('.v-card.handler-header .v-card-content .item-body'),

        montoTarjetaResultado: (page: Page) =>
        page.locator('.v-card.handler-header .v-card-heading .pago-info span').first(),

        metodoPagoTarjetaResultado: (page: Page) =>
        page.locator('.v-card.handler-header .v-card-heading .pago-info span').nth(1),

        nombrePersonaTarjetaResultado: (page: Page) =>
        page.locator('.v-card.handler-header .v-card-content .item-body .empresa-data .nombre'),

        documentoPersonaTarjetaResultado: (page: Page) =>
        page.locator('.v-card.handler-header .v-card-content .item-body .empresa-data .documento'),

        categoriaMotivoTarjetaResultado: (page: Page) =>
        page.locator('.v-card.handler-header .v-card-content .item-body .empresa-data .categoria'),
};
