import {type Page} from '@playwright/test';

export const PosTargets = {

    inputBuscarPersonaCaja: (page: Page) =>
        page.getByRole('textbox', {name: 'Buscar por nombre, razón'}),

    mensajePersonaNoEncontrada: (page: Page) =>
        page.locator('main').filter({hasText: 'Persona /empresa no encontrada en tu lista'}),


    btnDatosVenta: (page: Page) =>
        page.getByRole('button', {name: 'Datos'}),

    inputNombreVendedor: (page: Page) =>
        page.getByRole('textbox', {name: 'Nombre del vendedor'}),

    mensajeVendedorNoEncontrado: (page: Page) =>
        page.getByText('Persona no encontrada en tu lista de vendedores'),

    btnGuardarDatosVenta: (page: Page) =>
        page.getByRole('button', {name: 'Guardar datos'}),


    opcionDropdownPersona: (page: Page, texto: string) =>
        page.locator('.cmp-dropdown-options li, .cmp-dropdown-options .opcion-item, [class*="card-entidad"], article.content').filter({hasText: texto}).first(),
};
