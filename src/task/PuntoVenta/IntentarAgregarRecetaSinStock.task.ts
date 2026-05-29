import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import {ALMACENES_PV} from '@helpers/PuntoVenta/emision-data.helper';
import type {ItemVenta} from '@helpers/PuntoVenta/emision.types';

export const IntentarAgregarRecetaSinStock = (item: ItemVenta) => {
    const fn = async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await page.locator('div').filter({hasText: /^ALMACEN-AUTO$/}).nth(1).click();
        await page.getByText(ALMACENES_PV.VENTAS).click();
        await emision.buscarItem(item.codigo);
        await emision.seleccionarItem(item.nombre);
    };
    fn.displayName = 'Intentar agregar receta sin stock';
    return fn;
};
