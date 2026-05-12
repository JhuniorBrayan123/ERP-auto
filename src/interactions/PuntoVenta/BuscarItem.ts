// 📁 src/interactions/PuntoVenta/BuscarItem.ts
// Delega a EmisionPage.buscarItem() — NO duplica locators
import { Page } from '@playwright/test';
import { EmisionPage } from '../../pages/PuntoVenta/EmisionPage';

export const BuscarItem = (codigo: string) =>
    async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.buscarItem(codigo);
    };
