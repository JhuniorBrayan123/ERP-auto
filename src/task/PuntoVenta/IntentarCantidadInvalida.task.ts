// 📁 src/task/PuntoVenta/IntentarCantidadInvalida.task.ts
// SC-21: Buscar item → agregar → decrementar a 0 → intentar pagar
// Precondición: el usuario ya está dentro de la caja (beforeEach → IniciarVentaEnCaja)
import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import type {ItemVenta} from '@helpers/PuntoVenta/emision.types';

const DECREMENT_BTN = '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad_div:decrement"]';

export const IntentarCantidadInvalida = (item: ItemVenta) =>
    async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.buscarItem(item.codigo);
        await emision.seleccionarItem(item.nombre);
        // Decrementar para que la cantidad sea 0
        await page.locator(DECREMENT_BTN).click();
        // Intentar pagar con cantidad inválida
        await emision.clickPagar();
    };
