import type { Page } from '@playwright/test';



export const ItemsVendidosTargets = {
        inputBuscarItem: (page: Page) =>
        page.getByRole('textbox', { name: /Buscar codigo o descripcion/i }),

        linkVerComprobantes: (page: Page) =>
        page.getByText('Resumen de caja', { exact: true }).nth(1),
};



export const DescuentosTargets = {
        btnFiltrosAvanzados: (page: Page) =>
        page.getByRole('button', { name: /Ver Filtros Avanzados/i }),

        btnBorrarFiltros: (page: Page) =>
        page.getByRole('button', { name: /Borrar filtros/i }),

        inputCorrelativo: (page: Page) =>
        page.getByRole('textbox', { name: 'Correlativo', exact: true }),

        textoTotalDescuentoGlobal: (page: Page) =>
        page.getByText(/Total descuento global/i),

        btnAccionesFilaDescuento: (page: Page) =>
        page.locator('.cmp-dropdown-toggle').first(),
};
