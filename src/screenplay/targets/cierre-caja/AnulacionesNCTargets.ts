import type { Page } from '@playwright/test';

// ─── Targets de "Anulaciones y notas de crédito" en Cierre de Caja ───────────

export const AnulacionesNCTargets = {
    // ── Sección Anulaciones ──────────────────────────────────────────────────

    /** Botón "Ver Filtros Avanzados" de la sección Anulaciones (primer botón) */
    btnFiltrosAvanzadosAnulaciones: (page: Page) =>
        page.getByRole('button', { name: /Ver Filtros Avanzados/i }).first(),

    /** Botón "Borrar filtros" en Anulaciones */
    btnBorrarFiltrosAnulaciones: (page: Page) =>
        page.getByRole('button', { name: /Borrar filtros/i }).first(),

    /** Selector de tipo de documento en filtros de Anulaciones */
    selectorTipoDocumentoAnulaciones: (page: Page) =>
        page.getByText('Tipo de documento', { exact: true }).first(),

    /** Input de correlativo en filtros de Anulaciones */
    inputCorrelativoAnulaciones: (page: Page) =>
        page.getByRole('textbox', { name: 'Correlativo', exact: true }),

    /** Estado "DADO DE BAJA" en el listado de anulaciones */
    estadoDadoDeBaja: (page: Page) =>
        page.getByText('DADO DE BAJA', { exact: true }),

    /** Estado "ELIMINADO" en el listado (para notas de venta anuladas) */
    estadoEliminado: (page: Page) =>
        page.getByText('ELIMINADO', { exact: true }),

    // ── Sección Notas de Crédito ─────────────────────────────────────────────

    /** Botón "Ver Filtros Avanzados" de la sección Notas de Crédito (segundo botón) */
    btnFiltrosAvanzadosNC: (page: Page) =>
        page.getByRole('button', { name: /Ver Filtros Avanzados/i }).nth(1),

    /** Botón "Borrar filtros" en Notas de Crédito */
    btnBorrarFiltrosNC: (page: Page) =>
        page.getByRole('button', { name: /Borrar filtros/i }).nth(1),

    /** Selector de Serie en filtros de Notas de Crédito */
    selectorSerieNC: (page: Page) =>
        page.getByText('Serie', { exact: true }).nth(1),

    /** Input de correlativo en filtros de NC */
    inputCorrelativoNC: (page: Page) =>
        page.getByRole('textbox', { name: 'Correlativo', exact: true }),

    /** Botón de opciones de la primera fila NC (dropdown de acciones) */
    btnAccionesFilaNC: (page: Page) =>
        page.locator(
            '.container-v-grid-header-and-body.min-height > .v-grid > .container > tbody > .fila > td:nth-child(12) > .flex-row-align-items-center > .cmp-dropdown > .cmp-dropdown-toggle',
        ),

    /** Opción "Ver documento" dentro del menú de NC */
    opcionVerDocumentoNC: (page: Page) =>
        page.getByText('Ver documento', { exact: true }),

    /** Estado "EMITIDO" dentro de NC */
    estadoEmitidoNC: (page: Page) =>
        page.getByText('EMITIDO', { exact: true }),

    /** Estado "ACEPTADO" (Sunat) dentro de NC */
    estadoAceptadoNC: (page: Page) =>
        page.getByText('ACEPTADO', { exact: true }),

    // ── Modal de Anular Comprobante ──────────────────────────────────────────

    /** Selector de tipo de comprobante en el formulario de anulación */
    selectorTipoAnulacion: (page: Page) =>
        page.locator('div').filter({ hasText: /^Seleccionar$/ }).nth(3),

    /** Input de correlativo en el formulario de anulación */
    inputCorrelativoAnulacion: (page: Page) =>
        page.getByRole('textbox', { name: /Ej\./i }),

    /** Botón "Buscar" en el formulario de anulación */
    btnBuscarAnulacion: (page: Page) =>
        page.getByRole('button', { name: /^Buscar$/i }),

    /** Selector del motivo de anulación */
    selectorMotivoAnulacion: (page: Page) =>
        page.locator('div').filter({ hasText: /^Seleccionar$/ }).nth(3),

    /** Botón "Anular" en el formulario */
    btnAnular: (page: Page) =>
        page.getByRole('button', { name: /^Anular$/i }),

    /**
     * Opción genérica dentro de un dropdown abierto.
     *
     * Las opciones NO tienen ID propio (son div.v-select-form-option > span.v-h6).
     * El truco es acotar la búsqueda al contenedor del dropdown ABIERTO
     * (.v-select-base-options.is-open), que es único en el DOM mientras está desplegado.
     * Sirve tanto para Tipo de Comprobante como para Serie.
     */
    opcionDropdownAbierto: (page: Page, texto: string) =>
        page
            .locator('.v-select-base-options.is-open .v-select-form-option')
            .filter({ hasText: texto }),

    /** Toast de anulación exitosa */
    toastAnulacionExitosa: (page: Page) =>
        page.getByText(/¡Buen trabajo!/i),

    /** Botón de cerrar modal post-anulación */
    btnCerrarModalAnulacion: (page: Page) =>
        page.locator('.v-modal > .icon'),
};
