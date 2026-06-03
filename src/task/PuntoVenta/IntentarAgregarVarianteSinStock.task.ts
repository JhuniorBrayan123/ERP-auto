import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import type {ItemVenta} from '@helpers/PuntoVenta/emision.types';

const VARIANTE_2_IMAGEN = 'div:nth-child(2) > .left > .imagen > .imagen-default';

export const IntentarAgregarVarianteSinStock = (item: ItemVenta, clicksExtra: number = 25) => {
    const fn = async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.buscarItem(item.codigo);
        await emision.seleccionarItem(item.nombre);

        const VARIANTE_LOCATOR = page.locator(
            '[id="pv_punto-venta_cmp-item-variante_cmp-item-variante-grid_v-card:variante-1"] > .v-card-content > .card-wrapper > .card > .left > .imagen > .imagen-default'
        );

        const errorModal = page.getByText(
            'No puedes agregar este ítem a tu venta sobrepasando el stock disponible'
        );

        await VARIANTE_LOCATOR.click();

        for (let i = 0; i < clicksExtra; i++) {
            const modalVisible = await errorModal.isVisible();
            console.log(`Iteración ${i} - Modal visible: ${modalVisible}`);
            if (modalVisible) {
                console.log('BREAK');
                break;
            }
            await VARIANTE_LOCATOR.click({timeout: 2000}).catch(() => {
            });
            console.log(`click ${i}`);
            await page.waitForTimeout(200);
        }
    };
    fn.displayName = 'Intentar agregar variante sin stock';
    return fn;
};