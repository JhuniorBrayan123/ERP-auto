import {expect, type Page} from '@playwright/test';
import {ClientesTargets} from '@screenplay/targets/clientes-proveedores/ClientesTargets';

export const BuscarClienteEnListado = (criterio: string) => {
    const fn = async (page: Page): Promise<void> => {
        const input = ClientesTargets.inputBuscar(page);
        await input.click();
        await input.fill(criterio);
    };
    fn.displayName = `Buscar cliente por: ${criterio}`;
    return fn;
};

export const ValidarClienteVisibleEnListado = (texto: string) => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ClientesTargets.tbody(page)).toContainText(texto);
    };
    fn.displayName = `Validar cliente visible en listado: ${texto}`;
    return fn;
};

export const ValidarSinResultados = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ClientesTargets.celdaSinResultados(page)).toBeVisible();
    };
    fn.displayName = 'Validar que no hay resultados';
    return fn;
};

export const AbrirAccionContextualCliente = (accion: string) => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.botonContextual(page).click();
        await page.getByText(accion).click();
    };
    fn.displayName = `Abrir acción contextual: ${accion}`;
    return fn;
};

export const AbrirAccionYEsperarDrape = (accion: string) => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.botonContextual(page).click();
        await page.getByText(accion).click();
        await ClientesTargets.btnCerrarDrape(page).waitFor({state: 'visible', timeout: 10_000}).catch(() => {});
    };
    fn.displayName = `Abrir acción (con drape): ${accion}`;
    return fn;
};
