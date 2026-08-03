import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import type {ItemVenta} from '@helpers/PuntoVenta/emision.types';

export const IntentarAgregarComboSinStock = (item: ItemVenta) => {
    const fn = async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.buscarItem(item.codigo);
        await emision.seleccionarItem(item.nombre);

        const modalStock = page
            .getByText('No puedes agregar el item a tu venta porque no tienes stock')
            .first();

        if (await modalStock.isVisible({timeout: 5_000}).catch(() => false)) {
            return;
        }

        const btnIncrease = page
            .locator('.cmp-producto-img')
            .filter({hasText: item.nombre})
            .first();

        for (let i = 0; i < 10; i++) {
            if (await modalStock.isVisible({timeout: 500}).catch(() => false)) {
                return;
            }
            try {
                await btnIncrease.click({timeout: 5_000});
            } catch {
                
                
                if (await modalStock.isVisible({timeout: 1_000}).catch(() => false)) {
                    return;
                }
            }
            await page.waitForTimeout(400);
        }
    };
    fn.displayName = 'Intentar agregar combo sin stock';
    return fn;
};
