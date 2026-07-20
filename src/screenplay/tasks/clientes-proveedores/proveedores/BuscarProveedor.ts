import {type Page} from '@playwright/test';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';
import {esperarCargaOverlay} from '@utils/wait-helpers';

export const BuscarProveedorEnListado = (criterio: string) => {
    const fn = async (page: Page): Promise<void> => {
        const input = ProveedoresTargets.inputBuscar(page);
        await input.click();
        await input.fill(criterio);
        await page.keyboard.press('Enter');
        await esperarCargaOverlay(page).catch(() => {});
    };
    fn.displayName = `Buscar proveedor por: ${criterio}`;
    return fn;
};

export const AbrirAccionContextualProveedor = (accion: string) => {
    const fn = async (page: Page): Promise<void> => {
        await ProveedoresTargets.botonContextualProveedor(page).click();
        await page.getByText(accion).click();
    };
    fn.displayName = `Abrir acción contextual: ${accion}`;
    return fn;
};
