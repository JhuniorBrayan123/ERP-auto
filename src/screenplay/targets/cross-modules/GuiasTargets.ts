import {type Page} from '@playwright/test';

export const GuiasTargets = {
    // ─── Búsqueda en Nueva Guía ──────────────────────
    inputBuscarConductorGuia: (page: Page) =>
        page.getByRole('article').filter({ hasText: 'Datos del conductor y vehí' }).getByPlaceholder('Digite N° de documento'),
    
    mensajeConductorNoEncontrado: (page: Page) =>
        page.locator('main').filter({hasText: 'Conductor no encontrado'}),
};
