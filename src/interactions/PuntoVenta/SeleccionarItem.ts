// 📁 src/interactions/PuntoVenta/SeleccionarItem.ts
// Delega a EmisionPage.seleccionarItem() — NO duplica locators
import { Page } from '@playwright/test';
import { EmisionPage } from '../../pages/PuntoVenta/EmisionPage';

export const SeleccionarItem = (nombre: string) =>
    async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.seleccionarItem(nombre);
    };
