import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import {ALMACENES_PV} from '@helpers/PuntoVenta/emision-data.helper';
import type {ItemVenta} from '@helpers/PuntoVenta/emision.types';

export const IntentarAgregarListaSinStock = (item: ItemVenta) =>
    async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        // Cambiar almacén
        await page.getByText(ALMACENES_PV.AUTO).first().click();
        await page.getByText(ALMACENES_PV.VENTAS).click();
        // Buscar lista con item sin stock
        await emision.buscarItem(item.codigo);
        await emision.seleccionarItem(item.nombre);
    };
