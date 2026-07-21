import {expect, Page} from "@playwright/test";
import {IniciarGuiaYBuscarConductor} from "@screenplay/tasks/cross-modules/IniciarGuiaYBuscarConductor";
import {GuiasTargets} from "@screenplay/targets/cross-modules/GuiasTargets";

export const VerificarConductorNoEncontradoEnGuia = (numeroDocumento: string, nombreCaja: string = 'Caja de venta') => {
    const fn = async (page: Page): Promise<void> => {
        await IniciarGuiaYBuscarConductor(numeroDocumento, nombreCaja)(page);
        await expect(GuiasTargets.mensajeConductorNoEncontrado(page)).toBeVisible();
    };
    fn.displayName = 'Verificar Conductor No Encontrado en Guía';
    return fn;
};