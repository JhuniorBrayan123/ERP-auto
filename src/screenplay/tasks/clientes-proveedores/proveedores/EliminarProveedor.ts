import {expect, type Page} from '@playwright/test';
import {BuscarProveedorEnListado} from './BuscarProveedor';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';

export const EliminarProveedor = (numeroDocumento: string) => {
    const fn = async (page: Page): Promise<void> => {
        await BuscarProveedorEnListado(numeroDocumento)(page);

        await ProveedoresTargets.botonContextualProveedor(page).click();
        await ProveedoresTargets.opcionEliminarProveedor(page).click();
        await ProveedoresTargets.btnConfirmarEliminarProveedor(page).click();

        await expect(ProveedoresTargets.mensajeBuenTrabajo(page)).toBeVisible({timeout: 10_000});
        await expect(ProveedoresTargets.mensajeExitoEliminacion(page)).toBeVisible();

        await ProveedoresTargets.btnCerrarModal(page).click();
        await page.waitForTimeout(500);
    };
    fn.displayName = `Eliminar Proveedor — ${numeroDocumento}`;
    return fn;
};
