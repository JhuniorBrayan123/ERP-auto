// 📁 src/task/PuntoVenta/EditarNombreDeItem.task.ts
// SC-24: Buscar item → agregar → editar nombre del producto
import { Page } from '@playwright/test';
import { EmisionPage } from '../../pages/PuntoVenta/EmisionPage';
import type { ItemVenta } from '../../helpers/PuntoVenta/emision.types';

const INPUT_DESCRIPCION = '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:descripcion"]';

export const EditarNombreDeItem = (item: ItemVenta, nuevoNombre: string) =>
    async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
        await emision.buscarItem(item.codigo);
        await emision.seleccionarItem(item.nombre);
        // Abrir edición y cambiar nombre
        await emision.abrirEdicionItem();
        await page.locator(INPUT_DESCRIPCION).fill(nuevoNombre);
    };
