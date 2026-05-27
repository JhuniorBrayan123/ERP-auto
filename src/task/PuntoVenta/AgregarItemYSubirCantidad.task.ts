import {type Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import type {ItemVenta} from '@app-types/emision.types';

export const AgregarItemYSubirCantidad = (item: ItemVenta, incrementos: number = 3) => {
    const fn = async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.buscarItem(item.codigo);
        await page.locator('.image').click();
        const btnIncrease = page.locator('[id="pv_cmp-punto-venta_cmp-grilla-items:grilla_cmp-producto:item_v-step:cantidad_div:increase"]');
        for (let i = 0; i < incrementos; i++) {
            await btnIncrease.click();
        }
    };
    fn.displayName = `Agregar item y subir cantidad: ${item.nombre} (+${incrementos})`;
    return fn;
};
