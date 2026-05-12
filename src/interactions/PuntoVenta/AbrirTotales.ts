// 📁 src/interactions/PuntoVenta/AbrirTotales.ts
// Delega a EmisionPage.abrirTotales() — NO duplica locators
import { Page } from '@playwright/test';
import { EmisionPage } from '../../pages/PuntoVenta/EmisionPage';

export const AbrirTotales = () =>
    async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.abrirTotales();
    };
