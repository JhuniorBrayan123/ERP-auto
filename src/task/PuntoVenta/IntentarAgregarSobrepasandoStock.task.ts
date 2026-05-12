// 📁 src/task/PuntoVenta/IntentarAgregarSobrepasandoStock.task.ts
// SC-04: Buscar item sin stock → clicks repetidos hasta bloqueo
import { Page } from '@playwright/test';
import { EmisionPage } from '../../pages/PuntoVenta/EmisionPage';
import type { ItemVenta } from '../../helpers/PuntoVenta/emision.types';

export const IntentarAgregarSobrepasandoStock = (item: ItemVenta, clicksExtra: number = 8) =>
    async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.buscarItem(item.codigo);
        await emision.seleccionarItem(item.nombre);
        // Clicks repetidos en la imagen para sobrepasar stock
        for (let i = 0; i < clicksExtra; i++) {
            await page.locator('.image-default').first().click();
        }
    };
