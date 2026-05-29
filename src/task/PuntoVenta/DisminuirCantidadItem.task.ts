import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import type {ItemVenta} from '@helpers/PuntoVenta/emision.types';

const INCREASE_BTN = '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad_div:increase"]';
const DECREMENT_BTN = '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad_div:decrement"]';

export const DisminuirCantidadItem = (item: ItemVenta, incrementos: number, decrementos: number) => {
    const fn = async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.buscarItem(item.codigo);
        await emision.seleccionarItem(item.nombre);
        
        for (let i = 0; i < incrementos; i++) {
            await page.locator(INCREASE_BTN).click();
        }
        
        for (let i = 0; i < decrementos; i++) {
            await page.locator(DECREMENT_BTN).click();
        }
    };
    fn.displayName = 'Disminuir cantidad de item';
    return fn;
};
