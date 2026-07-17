import {expect, type Page} from '@playwright/test';
import {ClientesTargets} from '@screenplay/targets/clientes-proveedores/ClientesTargets';

export const MensajeBuenTrabajoVisible = () => {
    const fn = async (page: Page): Promise<boolean> => {
        return ClientesTargets.mensajeBuenTrabajo(page).isVisible().catch(() => false);
    };
    fn.displayName = '¿Mensaje Buen Trabajo visible?';
    return fn;
};

export const ClienteVisibleEnListado = (texto: string) => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ClientesTargets.tbody(page)).toContainText(texto);
    };
    fn.displayName = `Cliente visible en listado: ${texto}`;
    return fn;
};

export const ClienteContieneTextoEnDetalle = (texto: string) => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ClientesTargets.appContainer(page)).toContainText(texto);
    };
    fn.displayName = `Detalle contiene: ${texto}`;
    return fn;
};

export const CuerpoContieneTexto = (texto: string) => {
    const fn = async (page: Page): Promise<void> => {
        await expect(page.locator('body')).toContainText(texto);
    };
    fn.displayName = `Body contiene: ${texto}`;
    return fn;
};

export const ValidarCampoVacio = (namePattern: RegExp) => {
    const fn = async (page: Page): Promise<void> => {
        await expect(page.getByRole('textbox', {name: namePattern})).toBeEmpty();
    };
    fn.displayName = `Campo vacío: ${namePattern}`;
    return fn;
};

export const SinResultadosBusqueda = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ClientesTargets.celdaSinResultados(page)).toBeVisible();
    };
    fn.displayName = 'No hay resultados en búsqueda';
    return fn;
};
