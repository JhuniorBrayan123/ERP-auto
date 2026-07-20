import {type Page} from '@playwright/test';
import {ConductoresTargets} from '@screenplay/targets/clientes-proveedores/ConductoresTargets';

export const EditarNombreConductor = (nuevoNombre: string) => {
    const fn = async (page: Page): Promise<void> => {
        await ConductoresTargets.inputRazonSocial(page).click();
        await ConductoresTargets.inputRazonSocial(page).fill(nuevoNombre);
    };
    fn.displayName = `Editar nombre de conductor: ${nuevoNombre}`;
    return fn;
};

export const ClickGuardarCambiosConductor = () => {
    const fn = async (page: Page): Promise<void> => {
        await ConductoresTargets.btnGuardarCambios(page).click();
    };
    fn.displayName = 'Click en Guardar cambios (Conductor)';
    return fn;
};

export const CancelarCreacionConductor = () => {
    const fn = async (page: Page): Promise<void> => {
        await ConductoresTargets.btnCancelarForm(page).click();
        const btnConfirmar = page.getByRole('button', {name: 'Sí, cancelar'});
        if (await btnConfirmar.isVisible({timeout: 1000}).catch(() => false)) {
            await btnConfirmar.click();
        }
    };
    fn.displayName = 'Cancelar creación/edición de conductor';
    return fn;
};
