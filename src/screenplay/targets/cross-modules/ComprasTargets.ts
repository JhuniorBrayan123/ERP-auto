import {type Page} from '@playwright/test';

export const ComprasTargets = {
    // ─── Búsqueda en Nueva Compra ──────────────────────
    inputBuscarProveedorCompra: (page: Page) =>
        page.getByRole('textbox', {name: 'Digite N° de documento'}), // Puede ser placeholder o name según el caso, el codegen usa 'Digite N° de documento'
    
    mensajeProveedorNoEncontrado: (page: Page) =>
        page.locator('main').filter({hasText: 'Proveedor no encontrado'}),
};
