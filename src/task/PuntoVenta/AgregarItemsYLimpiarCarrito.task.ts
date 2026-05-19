// 📁 src/task/PuntoVenta/AgregarItemsYLimpiarCarrito.task.ts
// SC-27: Agregar lista de productos → limpiar todo el carrito
// Precondición: el usuario ya está dentro de la caja (beforeEach → IniciarVentaEnCaja)
import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import type {ItemVenta} from '@helpers/PuntoVenta/emision.types';

export const AgregarItemsYLimpiarCarrito = (item: ItemVenta) => {
    const fn = async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.buscarItem(item.codigo);
        await emision.seleccionarItem(item.nombre);
        // Seleccionar y agregar
        await page.locator('.v-step.selector').first().click();
        await page.locator('[id="_div:increase"]').first().click();
        await page.getByRole('button', {name: 'Agregar a venta'}).click();
        // Limpiar todo el carrito
        await page.getByText('Limpiar carrito').click();
    };
    fn.displayName = 'Agregar items y limpiar carrito';
    return fn;
};
