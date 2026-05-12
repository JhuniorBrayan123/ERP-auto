// 📁 src/task/PuntoVenta/IncrementarCantidadItem.task.ts
// SC-19: Buscar item → agregar → incrementar cantidad N veces
import { Page } from '@playwright/test';
import { EmisionPage } from '../../pages/PuntoVenta/EmisionPage';
import type { ItemVenta } from '../../helpers/PuntoVenta/emision.types';

const INCREASE_BTN = '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad_div:increase"]';

export const IncrementarCantidadItem = (item: ItemVenta, incrementos: number) =>
    async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
        await emision.buscarItem(item.codigo);
        await emision.seleccionarItem(item.nombre);
        // Incrementar cantidad
        for (let i = 0; i < incrementos; i++) {
            await page.locator(INCREASE_BTN).click();
        }
    };
