// 📁 src/task/PuntoVenta/BuscarYAgregarConSelectores.task.ts
// SC-14: Buscar item con selectores → completar obligatorio → agregar a venta
import { Page } from '@playwright/test';
import { EmisionPage } from '../../pages/PuntoVenta/EmisionPage';
import type { ItemVenta } from '../../helpers/PuntoVenta/emision.types';

export const BuscarYAgregarConSelectores = (item: ItemVenta) =>
    async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.buscarItem(item.codigo);
        await emision.seleccionarItem(item.nombre);
        // Completar selector obligatorio
        await page.getByText('(Obligatorio)').click();
        await page.locator('[id="_div:increase"] > .simbolo-mas').first().click();
        await page.getByRole('button', { name: 'Agregar a venta' }).click();
    };
