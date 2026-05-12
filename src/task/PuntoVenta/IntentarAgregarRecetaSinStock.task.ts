// 📁 src/task/PuntoVenta/IntentarAgregarRecetaSinStock.task.ts
// SC-17: Cambiar almacén → buscar receta con componente sin stock
import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import {ALMACENES_PV} from '@helpers/PuntoVenta/emision-data.helper';
import type {ItemVenta} from '@helpers/PuntoVenta/emision.types';

export const IntentarAgregarRecetaSinStock = (item: ItemVenta) =>
    async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await page.getByRole('button', {name: 'Continuar vendiendo'}).click();
        // Cambiar almacén para que la receta falle por stock
        await page.locator('div').filter({hasText: /^ALMACEN-AUTO$/}).nth(1).click();
        await page.getByText(ALMACENES_PV.VENTAS).click();
        // Buscar receta con item sin stock
        await emision.buscarItem(item.codigo);
        await emision.seleccionarItem(item.nombre);
    };
