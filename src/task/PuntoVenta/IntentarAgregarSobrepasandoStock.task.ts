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
            // Verificamos si ya salió el modal de error
            if (await errorModal.isVisible()) break;

            // Si hay un overscreen (bloqueo/carga) activo, esperamos brevemente a que desaparezca
            await blocker.waitFor({ state: 'hidden', timeout: 2000 }).catch(() => {});

            // Verificamos de nuevo por si el modal de error apareció mientras esperábamos
            if (await errorModal.isVisible()) break;

            try {
                // Click con timeout corto para que si un overlay intercepta el evento no espere 35s
                await page.locator('.image-default').first().click({ timeout: 1500 });
            } catch (e) {
                // Si el click fue interceptado, verificamos si es porque el modal ya apareció
                if (await errorModal.isVisible()) {
                    break;
                }
            }
        }
    };
    fn.displayName = 'Intentar agregar sobrepasando stock';
    return fn;
};
