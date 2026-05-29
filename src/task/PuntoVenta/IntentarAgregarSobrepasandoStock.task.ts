import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import type {ItemVenta} from '@helpers/PuntoVenta/emision.types';

export const IntentarAgregarSobrepasandoStock = (item: ItemVenta, clicksExtra: number = 25) => {
    const fn = async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.buscarItem(item.codigo);

        await emision.seleccionarItem(item.nombre);
        const errorModal = page.getByText('No puedes agregar este ítem a tu venta sobrepasando el stock disponible');
        const blocker = page.locator('[id="cmn_cmp-overscreen:block"]');

        for (let i = 0; i < clicksExtra; i++) {
            
            if (await errorModal.isVisible()) break;

            await blocker.waitFor({ state: 'hidden', timeout: 2000 }).catch(() => {});

            if (await errorModal.isVisible()) break;

            try {
                
                await page.locator('.image-default').first().click({ timeout: 1500 });
            } catch (e) {
                
                if (await errorModal.isVisible()) {
                    break;
                }
            }
        }
    };
    fn.displayName = 'Intentar agregar sobrepasando stock';
    return fn;
};
