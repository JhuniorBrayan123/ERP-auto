// 📁 src/task/PuntoVenta/IntentarPrecioInvalido.task.ts
// SC-23: Buscar item → agregar → editar con precio inválido → intentar pagar
// Precondición: el usuario ya está dentro de la caja (beforeEach → IniciarVentaEnCaja)
import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import type {ItemVenta} from '@helpers/PuntoVenta/emision.types';

export const IntentarPrecioInvalido = (item: ItemVenta, precioInvalido: string) => {
    const fn = async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.buscarItem(item.codigo);
        await emision.seleccionarItem(item.nombre);
        // Editar con precio inválido
        await emision.editarPrecioItem(precioInvalido);
        // Intentar pagar
        await emision.clickPagar();
    };
    fn.displayName = 'Intentar precio inválido';
    return fn;
};
