import {type Page} from '@playwright/test';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';
import {esperarCargaOverlay} from '@utils/wait-helpers';

export const ToggleSliderEstadoProveedor = () => {
    const fn = async (page: Page): Promise<void> => {
        await ProveedoresTargets.switchEstado(page).click();
        await ProveedoresTargets.botonContextualProveedor(page).click();
        await esperarCargaOverlay(page).catch(() => {});
    };
    fn.displayName = 'Toggle slider de estado de proveedor';
    return fn;
};
