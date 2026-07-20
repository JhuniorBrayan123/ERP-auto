import {expect, type Page} from '@playwright/test';
import {ClientesTargets} from '@screenplay/targets/clientes-proveedores/ClientesTargets';

export const AbrirDetalleCliente = () => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.botonContextual(page).click();
        await page.getByText('Ver cliente').click();
        await ClientesTargets.appContainer(page).waitFor({state: 'visible', timeout: 10_000});
    };
    fn.displayName = 'Abrir detalle del cliente';
    return fn;
};

export const ClickAtras = () => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.btnAtras(page).click();
    };
    fn.displayName = 'Click Atrás';
    return fn;
};

export const AgregarNotaAdicional = (titulo: string, mensaje: string) => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.btnNuevaNota(page).first().click();

        await ClientesTargets.inputTituloNota(page).fill(titulo);
        await ClientesTargets.textareaMensajeNota(page).fill(mensaje);
        await ClientesTargets.btnGuardarNota(page).click();

        await expect(ClientesTargets.appContainer(page)).toContainText(mensaje);
        await ClientesTargets.btnCerrarDrape(page).click();
    };
    fn.displayName = `Agregar nota adicional: ${titulo}`;
    return fn;
};

export const AbrirNotasAdicionales = () => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.botonContextual(page).click();
        await page.getByText('Ver notas adicionales').click();
    };
    fn.displayName = 'Abrir notas adicionales';
    return fn;
};

export const AbrirBitacora = () => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.botonContextual(page).click();
        await page.getByText('Ver bitácora').click();
        await ClientesTargets.btnCerrarDrape(page).waitFor({state: 'visible', timeout: 10_000}).catch(() => {});
    };
    fn.displayName = 'Abrir bitácora del cliente';
    return fn;
};

export const AbrirVentasAlCliente = () => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.botonContextual(page).click();
        await page.getByText('Ver ventas al cliente').click();
    };
    fn.displayName = 'Abrir ventas al cliente';
    return fn;
};

export const CerrarDrape = () => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.btnCerrarDrape(page).click();
    };
    fn.displayName = 'Cerrar panel drape';
    return fn;
};

export const AgregarNotaDesdePanel = (titulo: string, mensaje: string) => {
    const fn = async (page: Page): Promise<void> => {
        await page.getByRole('button', {name: 'Nueva nota adicional'}).click();
        await ClientesTargets.inputTituloNota(page).fill(titulo);
        await ClientesTargets.textareaMensajeNota(page).fill(mensaje);
        await ClientesTargets.btnGuardarNota(page).click();
    };
    fn.displayName = `Agregar nota desde panel: ${titulo}`;
    return fn;
};

export const EliminarNotaAdicional = () => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.botonContextualNota(page).click();
        await ClientesTargets.opcionEliminarNota(page).click();
        await ClientesTargets.btnConfirmarSi(page).click();
    };
    fn.displayName = 'Eliminar nota adicional';
    return fn;
};

export const SeleccionarPestaniaBitacora = (pestania: string) => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.pestaniaBitacora(page, pestania).click();
    };
    fn.displayName = `Seleccionar pestaña bitácora: ${pestania}`;
    return fn;
};

