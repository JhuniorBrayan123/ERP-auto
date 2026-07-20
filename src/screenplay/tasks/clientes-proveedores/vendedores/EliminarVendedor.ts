import {expect, type Page} from '@playwright/test';
import {VendedoresTargets} from '@screenplay/targets/clientes-proveedores/VendedoresTargets';
import {BuscarVendedorEnListado, AbrirAccionContextualVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/BuscarVendedor';
import {esperarCargaOverlay} from '@utils/wait-helpers';

export const EliminarVendedor = (criterio: string) => {
    const fn = async (page: Page): Promise<void> => {
        await BuscarVendedorEnListado(criterio)(page);
        await AbrirAccionContextualVendedor('Eliminar vendedor')(page);
        await VendedoresTargets.btnConfirmarEliminarVendedor(page).click();
        await expect(VendedoresTargets.mensajeBuenTrabajo(page)).toBeVisible();
        await VendedoresTargets.btnCerrarModal(page).click();
        await esperarCargaOverlay(page).catch(() => {});
    };
    fn.displayName = `Eliminar vendedor: ${criterio}`;
    return fn;
};
