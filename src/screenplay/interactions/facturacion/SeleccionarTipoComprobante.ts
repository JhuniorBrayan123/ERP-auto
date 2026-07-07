import { expect, type Page } from '@playwright/test';
import { esperarCargaOverlay } from '@utils/wait-helpers';

type TipoComprobante = 'BOLETA' | 'FACTURA' | 'NOTA DE VENTA' | 'COTIZACION';

const ID_POR_TIPO: Record<TipoComprobante, number> = {
    BOLETA: 1004,
    FACTURA: 1003,
    'NOTA DE VENTA': 2016,
    COTIZACION: 3007,
};

export const SeleccionarTipoComprobante = (tipo: TipoComprobante) => {
    const fn = async (page: Page): Promise<void> => {
        await esperarCargaOverlay(page).catch(() => {});

        
        await page.getByText('BOLETA').first().click().catch(() =>
            page.getByText(tipo).first().click()
        );

        const id = ID_POR_TIPO[tipo];
        const opcion = page.locator(
            `[id="pv_punto-venta_cmp-factura-boleta-header_v-select:tipo-comprobante_v-option:opcion-${id}"]`
        );
        await expect(opcion).toBeVisible({ timeout: 5_000 });
        await opcion.getByText(tipo === 'NOTA DE VENTA' ? 'NOTA DE VENTA' : tipo).click();
    };
    fn.displayName = `Seleccionar tipo de comprobante: ${tipo}`;
    return fn;
};
