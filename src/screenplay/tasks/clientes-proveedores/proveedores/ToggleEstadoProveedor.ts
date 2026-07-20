import {type Page} from '@playwright/test';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';

export const ToggleSliderEstadoProveedor = () => {
    const fn = async (page: Page): Promise<void> => {
        // En Proveedores, la desactivación desde el menú contextual levanta un modal con un slider
        // o si se hace click en "Desactivar proveedor", se cambia de frente.
        // Según el codegen (línea 1045): Desactivar proveedor -> click en .slider -> expect INACTIVO
        await ProveedoresTargets.sliderEstado(page).click();
    };
    fn.displayName = 'Toggle slider de estado de proveedor';
    return fn;
};
