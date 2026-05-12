// 📁 src/task/PuntoVenta/IntentarAgregarVarianteSinStock.task.ts
// SC-12: Buscar variante estricta → clicks repetidos hasta bloqueo por stock
import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import type {ItemVenta} from '@helpers/PuntoVenta/emision.types';

const VARIANTE_2_IMAGEN = 'div:nth-child(2) > .left > .imagen > .imagen-default';

export const IntentarAgregarVarianteSinStock = (item: ItemVenta, clicksExtra: number = 8) =>
    async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await page.getByRole('button', {name: 'Continuar vendiendo'}).click();
        await emision.buscarItem(item.codigo);
        await emision.seleccionarItem(item.nombre);
        // Click en variante específica
        await page.locator('[id="pv_punto-venta_cmp-item-variante_cmp-item-variante-grid_v-card:variante-2"] > .v-card-content > .card-wrapper > .card > .left > .imagen > .imagen-default').click();
        // Clicks repetidos en variante 2 para sobrepasar stock
        for (let i = 0; i < clicksExtra; i++) {
            await page.locator(VARIANTE_2_IMAGEN).click();
        }
    };
