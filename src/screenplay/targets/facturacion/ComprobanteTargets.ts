import type { Page } from '@playwright/test';

export const ComprobanteTargets = {

    
        pillFacturacion: (page: Page) =>
        page.locator('[id="pv_comprobantes_cmp-header-comprobantes_categorias:pill-FACTURACION"]'),

        pillVentas: (page: Page) =>
        page.locator('[id="pv_comprobantes_cmp-header-comprobantes_categorias:pill-VENTAS"]'),

    btnVerFiltrosAvanzados: (page: Page) =>
        page.getByRole('button', { name: 'Ver Filtros Avanzados' }),

    selectTipoComprobante: (page: Page) =>
        page.getByText('Tipo de comprobante').first(),

    opcionTipoFiltro: (page: Page, tipo: string) =>
        page.getByText(tipo, { exact: true }),

    inputCorrelativoFiltro: (page: Page) =>
        page.getByRole('textbox', { name: 'Correlativo' }),

    
    linkVerComprobante: (page: Page) =>
        page.getByRole('link', { name: 'Ver comprobante' }),

    opcionBitacora: (page: Page) =>
        page.getByText('Bitácora'),

    btnCerrarDrape: (page: Page) =>
        page.locator('.drape.is-open > .button-close').first(),

    
    textoComprobanteEmitido: (page: Page) =>
        page.getByText('Tu comprobante fue emitido correctamente'),

    mensajeNumeroEmitido: (page: Page, numero: string) =>
        page.getByText(numero),

        regexNumeroComprobante: /[A-Z]{1,4}\d{0,4}-\d{5,}/,
};
