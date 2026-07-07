import type { Page } from '@playwright/test';

export const AdelantosTargets = {

        cabeceraAdelantos: (page: Page) =>
        page.locator('.title-content').filter({ hasText: /Adelantos encontrados/i }).first(),

    flechaExpandir: (page: Page) =>
        page.locator('.title-content > .arrow-icon').first(),

    
        dropdownSerie: (page: Page) =>
        page.locator('[id="_div:dropdown"]').getByText('Serie'),

        opcionSerieBoleta: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-factura-boleta-adelantos_div:opcion-serie-0"]').getByText('B001'),

        opcionSerieFactura: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-factura-boleta-adelantos_div:opcion-serie-0"]').getByText('F001'),

        opcionSerieNotaVenta: (page: Page) =>
        page.locator('[id="pv_punto-venta_cmp-nota-venta-adelantos_div:opcion-serie-0"]').getByText('NV01'),

    inputCorrelativo: (page: Page) =>
        page.getByRole('textbox', { name: 'Correlativo' }),

    
        checkboxPrimerAdelanto: (page: Page) =>
        page.locator('.v-checkbox-default-label.flex-row-align-items-center > span').first(),

    checkboxAdelanto: (page: Page, indice: number = 0) =>
        page.locator(`[id="pv_punto-venta_cmp-factura-boleta-adelantos_v-checkbox:agregar-adelanto-${indice}"]`),

    
    textoTotalAnticipos: (page: Page) =>
        page.getByText(/Total anticipos/i),
};
