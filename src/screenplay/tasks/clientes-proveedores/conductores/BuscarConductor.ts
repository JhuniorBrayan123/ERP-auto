import {type Page} from '@playwright/test';
import {ConductoresTargets} from '@screenplay/targets/clientes-proveedores/ConductoresTargets';

export const BuscarConductorEnListado = (textoBusqueda: string) => {
    const fn = async (page: Page): Promise<void> => {
        const input = ConductoresTargets.inputBuscar(page);
        await input.click();
        await input.fill('');
        await input.fill(textoBusqueda);
        
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000); 
    };
    fn.displayName = `Buscar conductor: ${textoBusqueda}`;
    return fn;
};

export const AbrirAccionContextualConductor = (accion: 'Editar conductor' | 'Ver bitácora' | 'Desactivar conductor' | 'Activar conductor' | 'Ver guias a conductor') => {
    const fn = async (page: Page): Promise<void> => {
        await page.locator('.button-actions').first().click();
        
        if (accion === 'Editar conductor') await ConductoresTargets.opcionEditarConductor(page).click();
        if (accion === 'Ver bitácora') await ConductoresTargets.opcionVerBitacora(page).click();
        if (accion === 'Desactivar conductor') await ConductoresTargets.opcionDesactivarConductor(page).click();
        if (accion === 'Activar conductor') await ConductoresTargets.opcionActivarConductor(page).click();
        if (accion === 'Ver guias a conductor') await ConductoresTargets.opcionVerGuias(page).click();
    };
    fn.displayName = `Acción contextual (Conductor): ${accion}`;
    return fn;
};
