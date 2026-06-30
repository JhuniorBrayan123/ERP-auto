import type { Page } from '@playwright/test';

// ─── Targets de la pestaña "Ingresos y egresos" en Cierre de Caja ────────────

export const IngresosEgresosTargets = {
    /** Campo de búsqueda por serie o correlativo */
    inputBuscarSerieCorrelativo: (page: Page) =>
        page.locator('[id="pv_cmp-cierre-caja_cmp-sales-cierre_cmp-incomes-expenses-filtro:filtros_v-input:busqueda"]'),

    /** Contenedor de la sección "Ingresos" */
    seccionIngresos: (page: Page) =>
        page.getByText(/Total Ingresos/i),

    /** Contenedor de la sección "Egresos" */
    seccionEgresos: (page: Page) =>
        page.getByText(/Total Egresos/i),

    // ── Formulario de Ingreso de Dinero ─────────────────────────────────────

    /** Input de monto en el modal de ingreso/egreso */
    inputMonto: (page: Page) =>
        page.locator('[id="pv_puntoventa_v-modal:cmp-ingreso-egreso-dinero_v-input:moneda"]'),

    /** Input del motivo de ingreso */
    inputMotivoIngreso: (page: Page) =>
        page.getByRole('textbox', { name: /Digita el motivo de tu ingreso/i }),

    /** Input del motivo de egreso */
    inputMotivoEgreso: (page: Page) =>
        page.getByRole('textbox', { name: /Digita el motivo de tu egreso/i }),

    /** Campo de búsqueda de persona/proveedor en ingreso/egreso */
    inputBuscarPersona: (page: Page) =>
        page.getByRole('textbox', { name: /Busca por nombre o documento/i }),

    /** Botón "Registrar ingreso" */
    btnRegistrarIngreso: (page: Page) =>
        page.getByRole('button', { name: /Registrar ingreso/i }),

    /** Botón "Registrar egreso" */
    btnRegistrarEgreso: (page: Page) =>
        page.getByRole('button', { name: /Registrar egreso/i }),

    /** Toast de confirmación de ingreso registrado */
    toastIngresoRegistrado: (page: Page) =>
        page.getByText(/Tu ingreso fue registrado/i),

    /** Toast de confirmación de egreso registrado ("¡Buen trabajo!") */
    toastEgresoRegistrado: (page: Page) =>
        page.getByText(/¡Buen trabajo!/i),

    /** Botón "Cerrar" del modal de confirmación post-ingreso/egreso */
    btnCerrarModal: (page: Page) =>
        page.getByRole('button', { name: /Cerrar/i }),

    /** Número de recibo mostrado en el modal de confirmación
     *  Usar con: await locator.textContent() y luego extraer con regex */
    textoNumeroRecibo: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-response-ingreso-egreso_v-button:imprimir-a4"]')
            .locator('xpath=ancestor::div[contains(@class,"modal")]')
            .getByText(/RC01-|RP01-/i),
};
