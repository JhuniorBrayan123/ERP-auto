import {type Page} from '@playwright/test';
import {VendedoresTargets} from '@screenplay/targets/clientes-proveedores/VendedoresTargets';

export const EditarNombreVendedor = (nuevoNombre: string) => {
    const fn = async (page: Page): Promise<void> => {
        await VendedoresTargets.inputRazonSocial(page).click();
        await VendedoresTargets.inputRazonSocial(page).fill(nuevoNombre);
    };
    fn.displayName = `Editar nombre de vendedor: ${nuevoNombre}`;
    return fn;
};

export const EditarMetasVendedor = (nuevaCantidad?: string, nuevoMonto?: string) => {
    const fn = async (page: Page): Promise<void> => {
        if (nuevaCantidad !== undefined) {
            await VendedoresTargets.inputMetaCantidad(page).click();
            await VendedoresTargets.inputMetaCantidad(page).fill(nuevaCantidad);
        }
        if (nuevoMonto !== undefined) {
            await VendedoresTargets.inputMetaMonto(page).click();
            await VendedoresTargets.inputMetaMonto(page).fill(nuevoMonto);
        }
    };
    fn.displayName = `Editar metas de vendedor`;
    return fn;
};

export const ClickGuardarCambiosVendedor = () => {
    const fn = async (page: Page): Promise<void> => {
        await VendedoresTargets.btnGuardarCambios(page).click();
    };
    fn.displayName = 'Click en Guardar cambios (Vendedor)';
    return fn;
};

export const CancelarCreacionVendedor = () => {
    const fn = async (page: Page): Promise<void> => {
        await VendedoresTargets.btnCancelarForm(page).click();
        // A veces vendedores no pide confirmación o si la pide, el botón debe ser 'Sí, cancelar'
        const btnConfirmar = page.getByRole('button', {name: 'Sí, cancelar'});
        if (await btnConfirmar.isVisible({timeout: 1000}).catch(() => false)) {
            await btnConfirmar.click();
        }
    };
    fn.displayName = 'Cancelar creación/edición de vendedor';
    return fn;
};
