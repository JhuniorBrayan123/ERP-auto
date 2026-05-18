import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import type {ItemVenta} from '@helpers/PuntoVenta/emision.types';

const INPUT_DESCRIPCION = '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:descripcion"]';

export const EditarNombreDeItem = (item: ItemVenta, nuevoNombre: string) => {
    const fn = async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.buscarItem(item.codigo);
        await emision.seleccionarItem(item.nombre);
        // Abrir edición y cambiar nombre
        await emision.abrirEdicionItem();
        await page.locator(INPUT_DESCRIPCION).fill(nuevoNombre);
    };
    fn.displayName = 'Editar nombre de item';
    return fn;
};
