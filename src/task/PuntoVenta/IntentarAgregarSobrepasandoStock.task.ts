import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import type {ItemVenta} from '@helpers/PuntoVenta/emision.types';

export const IntentarAgregarSobrepasandoStock = (item: ItemVenta, clicksExtra: number = 25) =>
    async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.buscarItem(item.codigo);

        await emision.seleccionarItem(item.nombre);
        const errorModal = page.getByText('No puedes agregar este ítem a tu venta sobrepasando el stock disponible')
        for (let i = 0; i < clicksExtra; i++) {
            if (await errorModal.isVisible()) break;
            await page.locator('.image-default').first().click();
        }
    };
