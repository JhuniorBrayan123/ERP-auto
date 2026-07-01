import type { Page } from '@playwright/test';



export const AnulacionesNCTargets = {
    

        btnFiltrosAvanzadosAnulaciones: (page: Page) =>
        page.getByRole('button', { name: /Ver Filtros Avanzados/i }).first(),

        btnBorrarFiltrosAnulaciones: (page: Page) =>
        page.getByRole('button', { name: /Borrar filtros/i }).first(),

        selectorTipoDocumentoAnulaciones: (page: Page) =>
        page.getByText('Tipo de documento', { exact: true }).first(),

        inputCorrelativoAnulaciones: (page: Page) =>
        page.getByRole('textbox', { name: 'Correlativo', exact: true }),

        estadoDadoDeBaja: (page: Page) =>
        page.getByText('DADO DE BAJA', { exact: true }),

        estadoEliminado: (page: Page) =>
        page.getByText('ELIMINADO', { exact: true }),

    

        btnFiltrosAvanzadosNC: (page: Page) =>
        page.getByRole('button', { name: /Ver Filtros Avanzados/i }).nth(1),

        btnBorrarFiltrosNC: (page: Page) =>
        page.getByRole('button', { name: /Borrar filtros/i }).nth(1),

        selectorSerieNC: (page: Page) =>
        page.getByText('Serie', { exact: true }).nth(1),

        inputCorrelativoNC: (page: Page) =>
        page.getByRole('textbox', { name: 'Correlativo', exact: true }),

        btnAccionesFilaNC: (page: Page) =>
        page.locator(
            '.container-v-grid-header-and-body.min-height > .v-grid > .container > tbody > .fila > td:nth-child(12) > .flex-row-align-items-center > .cmp-dropdown > .cmp-dropdown-toggle',
        ),

        opcionVerDocumentoNC: (page: Page) =>
        page.getByText('Ver documento', { exact: true }),

        estadoEmitidoNC: (page: Page) =>
        page.getByText('EMITIDO', { exact: true }),

        estadoAceptadoNC: (page: Page) =>
        page.getByText('ACEPTADO', { exact: true }),

    

        selectorTipoAnulacion: (page: Page) =>
        page.locator('div').filter({ hasText: /^Seleccionar$/ }).nth(3),

        inputCorrelativoAnulacion: (page: Page) =>
        page.getByRole('textbox', { name: /Ej\./i }),

        btnBuscarAnulacion: (page: Page) =>
        page.getByRole('button', { name: /^Buscar$/i }),

        selectorMotivoAnulacion: (page: Page) =>
        page.locator('div').filter({ hasText: /^Seleccionar$/ }).nth(3),

        btnAnular: (page: Page) =>
        page.getByRole('button', { name: /^Anular$/i }),

        opcionDropdownAbierto: (page: Page, texto: string) =>
        page
            .locator('.v-select-base-options.is-open .v-select-form-option')
            .filter({ hasText: texto }),

        toastAnulacionExitosa: (page: Page) =>
        page.getByText(/¡Buen trabajo!/i),

        btnCerrarModalAnulacion: (page: Page) =>
        page.locator('.v-modal > .icon'),
};
