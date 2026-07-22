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

export const AbrirAccionContextualConductor = (accion: 'Editar conductor' | 'Ver bitácora' | 'Desactivar conductor' | 'Activar conductor' | 'Ver guias a conductor' | 'Eliminar conductor') => {
    const fn = async (page: Page): Promise<void> => {
        await ConductoresTargets.botonContextualConductor(page).click();
        
        if (accion === 'Editar conductor') await ConductoresTargets.opcionEditarConductor(page).click();
        if (accion === 'Ver bitácora') await ConductoresTargets.opcionVerBitacora(page).click();
        if (accion === 'Desactivar conductor') await ConductoresTargets.opcionDesactivarConductor(page).click();
        if (accion === 'Activar conductor') await ConductoresTargets.opcionActivarConductor(page).click();
        if (accion === 'Ver guias a conductor') await ConductoresTargets.opcionVerGuias(page).click();
        if (accion === 'Eliminar conductor') await ConductoresTargets.opcionEliminarConductor(page).click();
    };
    fn.displayName = `Acción contextual (Conductor): ${accion}`;
    return fn;
};

export const ValidarConductorVisible = (texto: string) => {
    const fn = async (page: Page): Promise<boolean> => {
        return await ConductoresTargets.tbody(page)
            .getByText(texto, {exact: false})
            .isVisible({timeout: 5_000})
            .catch(() => false);
    };
    fn.displayName = `Validar conductor visible en listado: ${texto}`;
    return fn;
};

export const ValidarSinResultados = () => {
    const fn = async (page: Page): Promise<boolean> => {
        return await page.getByText('NO HAY RESULTADOS PARA TU BÚSQUEDA')
            .isVisible({timeout: 5_000})
            .catch(() => false);
    };
    fn.displayName = 'Validar que no hay resultados (conductor)';
    return fn;
};
