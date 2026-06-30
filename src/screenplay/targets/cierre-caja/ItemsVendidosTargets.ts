import type { Page } from '@playwright/test';

// ─── Targets de "Items vendidos" en Cierre de Caja ───────────────────────────

export const ItemsVendidosTargets = {
    /** Campo de búsqueda por código o descripción de ítem */
    inputBuscarItem: (page: Page) =>
        page.getByRole('textbox', { name: /Buscar codigo o descripcion/i }),

    /** Botón/link para ver comprobantes asociados a un ítem */
    linkVerComprobantes: (page: Page) =>
        page.getByText('Resumen de caja', { exact: true }).nth(1),
};

// ─── Targets de "Descuentos" en Cierre de Caja ───────────────────────────────

export const DescuentosTargets = {
    /** Botón "Ver Filtros Avanzados" en la pestaña Descuentos */
    btnFiltrosAvanzados: (page: Page) =>
        page.getByRole('button', { name: /Ver Filtros Avanzados/i }),

    /** Botón "Borrar filtros" en Descuentos */
    btnBorrarFiltros: (page: Page) =>
        page.getByRole('button', { name: /Borrar filtros/i }),

    /** Input de correlativo en filtros de Descuentos */
    inputCorrelativo: (page: Page) =>
        page.getByRole('textbox', { name: 'Correlativo', exact: true }),

    /** Texto del total de descuento global */
    textoTotalDescuentoGlobal: (page: Page) =>
        page.getByText(/Total descuento global/i),

    /** Botón de acciones del primer comprobante con descuento */
    btnAccionesFilaDescuento: (page: Page) =>
        page.locator('.cmp-dropdown-toggle').first(),
};
