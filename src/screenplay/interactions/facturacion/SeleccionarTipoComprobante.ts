import {type Page} from '@playwright/test';
import {esperarCargaOverlaySiVisible} from '@utils/wait-helpers';

type TipoComprobante = 'BOLETA' | 'FACTURA' | 'NOTA DE VENTA' | 'COTIZACION' | 'COTIZACIÓN' | 'PEDIDO';

const ID_POR_TIPO: Record<string, number> = {
    BOLETA: 1004,
    FACTURA: 1003,
    'NOTA DE VENTA': 2016,
    COTIZACION: 3007,
    'COTIZACIÓN': 3007,
    PEDIDO: 2011,
};

const TEXTO_EN_UI: Record<string, string> = {
    BOLETA: 'BOLETA',
    FACTURA: 'FACTURA',
    'NOTA DE VENTA': 'NOTA DE VENTA',
    COTIZACION: 'COTIZACIÓN',
    PEDIDO: 'PEDIDO',
};

export const SeleccionarTipoComprobante = (tipo: TipoComprobante) => {
    const fn = async (page: Page): Promise<void> => {
        await esperarCargaOverlaySiVisible(page).catch(() => {
        });
        await page.getByText('BOLETA').first().click().catch(() =>
            page.getByText(TEXTO_EN_UI[tipo] ?? tipo).first().click()
        );

        const id = ID_POR_TIPO[tipo];
        const textoBoton = TEXTO_EN_UI[tipo] ?? tipo;
        const opcion = page.locator(
            `[id="pv_punto-venta_cmp-factura-boleta-header_v-select:tipo-comprobante_v-option:opcion-${id}"]`
        );
        const opcionVisible = await opcion.isVisible().catch(() => false);
        if (opcionVisible) {
            await opcion.getByText(textoBoton).click();
        } else {
            await page.getByText(textoBoton).first().click({force: true});
        }
    };
    fn.displayName = `Seleccionar tipo de comprobante: ${tipo}`;
    return fn;
};
