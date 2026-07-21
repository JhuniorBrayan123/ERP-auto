import {expect, type Page} from '@playwright/test';
import {ConductoresTargets} from '@screenplay/targets/clientes-proveedores/ConductoresTargets';
import {AbrirAccionContextualConductor, BuscarConductorEnListado} from './BuscarConductor';

export const EliminarConductor = (numeroDocumento: string) => {
    const fn = async (page: Page): Promise<void> => {
        await BuscarConductorEnListado(numeroDocumento)(page);

        await AbrirAccionContextualConductor('Eliminar conductor')(page);

        await ConductoresTargets.btnConfirmarEliminar(page).click();

        await expect(ConductoresTargets.mensajeBuenTrabajo(page)).toBeVisible({timeout: 10_000});
        await expect(ConductoresTargets.mensajeExitoEliminacion(page)).toBeVisible();

        await ConductoresTargets.btnCerrarModal(page).click();
        await page.waitForTimeout(500);
    };
    fn.displayName = `Eliminar Conductor — ${numeroDocumento}`;
    return fn;
};
