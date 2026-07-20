import {type Page} from '@playwright/test';
import {PosTargets} from '@screenplay/targets/cross-modules/PosTargets';
import {ComprasTargets} from '@screenplay/targets/cross-modules/ComprasTargets';
import {GuiasTargets} from '@screenplay/targets/cross-modules/GuiasTargets';

export const BuscarClienteEnCaja = (documento: string) => {
    const fn = async (page: Page): Promise<void> => {
        await PosTargets.inputBuscarPersonaCaja(page).click();
        await PosTargets.inputBuscarPersonaCaja(page).fill('');
        await PosTargets.inputBuscarPersonaCaja(page).fill(documento);
        await page.waitForTimeout(1000);
    };
    fn.displayName = `Buscar cliente en caja: ${documento}`;
    return fn;
};

export const BuscarVendedorEnCaja = (documento: string) => {
    const fn = async (page: Page): Promise<void> => {
        await PosTargets.btnDatosVenta(page).click();
        await PosTargets.inputNombreVendedor(page).click();
        await PosTargets.inputNombreVendedor(page).fill('');
        await PosTargets.inputNombreVendedor(page).fill(documento);
        await page.waitForTimeout(1000);
    };
    fn.displayName = `Buscar vendedor en caja: ${documento}`;
    return fn;
};

export const BuscarProveedorEnCompra = (documento: string) => {
    const fn = async (page: Page): Promise<void> => {
        await ComprasTargets.inputBuscarProveedorCompra(page).click();
        await ComprasTargets.inputBuscarProveedorCompra(page).fill('');
        await ComprasTargets.inputBuscarProveedorCompra(page).fill(documento);
        await page.waitForTimeout(1000);
    };
    fn.displayName = `Buscar proveedor en compra: ${documento}`;
    return fn;
};

export const BuscarConductorEnGuia = (documento: string) => {
    const fn = async (page: Page): Promise<void> => {
        await GuiasTargets.inputBuscarConductorGuia(page).click();
        await GuiasTargets.inputBuscarConductorGuia(page).fill('');
        await GuiasTargets.inputBuscarConductorGuia(page).fill(documento);
        await page.waitForTimeout(1000);
    };
    fn.displayName = `Buscar conductor en guía: ${documento}`;
    return fn;
};
