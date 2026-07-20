import {type Page} from '@playwright/test';

export const ComprasTargets = {
    
    inputBuscarProveedorCompra: (page: Page) =>
        page.getByRole('textbox', {name: 'Digite N° de documento'}), 
    
    mensajeProveedorNoEncontrado: (page: Page) =>
        page.locator('main').filter({hasText: 'Proveedor no encontrado'}),
};
