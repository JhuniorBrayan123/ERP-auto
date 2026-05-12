// 📁 src/task/PuntoVenta/AgregarDosItemsYEliminarUno.task.ts
// SC-25: Agregar 2 items → eliminar el primero (el de arriba en la pila)
// Precondición: el usuario ya está dentro de la caja (beforeEach → IniciarVentaEnCaja)
import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import type {ItemVenta} from '@helpers/PuntoVenta/emision.types';

const BTN_CANCELAR = '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-cancelar"]';

export const AgregarDosItemsYEliminarUno = (item1: ItemVenta, item2: ItemVenta, indiceEliminar: number = 1) =>
    async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        // Agregar primer item
        await emision.buscarItem(item1.codigo);
        await emision.seleccionarItem(item1.nombre);
        // Agregar segundo item
        const buscador = page.getByRole('textbox', {name: 'Escanea o busca por nombre, c'});
        await buscador.dblclick();
        await buscador.fill(item2.codigo);
        await emision.seleccionarItem(item2.nombre);
        // Eliminar item por índice (pila: el último agregado queda arriba)
        await page.locator(BTN_CANCELAR).nth(indiceEliminar).click();
    };
