// 📁 src/task/PuntoVenta/BuscarYAgregarItemSimple.task.ts
// SC-03, SC-05, SC-06: Continuar vendiendo → buscar → seleccionar
// Task genérica para items simples (stock estricto, flexible, sin control)
import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import type {ItemVenta} from '@helpers/PuntoVenta/emision.types';

export const BuscarYAgregarItemSimple = (item: ItemVenta) =>
    async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await page.getByRole('button', {name: 'Continuar vendiendo'}).click();
        await emision.buscarItem(item.codigo);
        await emision.seleccionarItem(item.nombre);
    };
