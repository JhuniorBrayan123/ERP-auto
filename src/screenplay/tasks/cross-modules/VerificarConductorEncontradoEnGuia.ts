import {expect, Page} from "@playwright/test";
import {IniciarGuiaYBuscarConductor} from "@screenplay/tasks/cross-modules/IniciarGuiaYBuscarConductor";
import {PosTargets} from "@screenplay/targets/cross-modules/PosTargets";

export const VerificarConductorEncontradoEnGuia = (numeroDocumento: string, nombreCaja: string = 'Caja de venta') => {
    const fn = async (page: Page): Promise<void> => {
        await IniciarGuiaYBuscarConductor(numeroDocumento, nombreCaja)(page);

        await expect(PosTargets.opcionDropdownPersona(page, numeroDocumento)).toBeVisible();
        await PosTargets.opcionDropdownPersona(page, numeroDocumento).click();
        await expect(page.locator('main')).toContainText(numeroDocumento);
    };
    fn.displayName = 'Verificar Conductor Encontrado en Guía';
    return fn;
};