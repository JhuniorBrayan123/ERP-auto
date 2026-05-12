// 📁 src/task/PuntoVenta/AgregarItemConSelectorYEliminar.task.ts
// SC-26: Agregar item con selector → desplegar hijos → eliminar
// Precondición: el usuario ya está dentro de la caja (beforeEach → IniciarVentaEnCaja)
import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import type {ItemVenta} from '@helpers/PuntoVenta/emision.types';

const BTN_CANCELAR = '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-cancelar"]';

export const AgregarItemConSelectorYEliminar = (item: ItemVenta) =>
    async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.buscarItem(item.codigo);
        await emision.seleccionarItem(item.nombre);
        // Incrementar selector y agregar a venta
        await page.locator('[id="_div:increase"]').first().click();
        await page.getByRole('button', {name: 'Agregar a venta'}).click();
        // Desplegar hijos del item
        await page.locator('.deploy-children').click();
        // Eliminar el item
        await page.locator(BTN_CANCELAR).click();
    };
