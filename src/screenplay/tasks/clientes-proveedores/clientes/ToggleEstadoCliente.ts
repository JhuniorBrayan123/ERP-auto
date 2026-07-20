import {type Page} from '@playwright/test';
import {ClientesTargets} from '@screenplay/targets/clientes-proveedores/ClientesTargets';
import {esperarCargaOverlay} from '@utils/wait-helpers';

export const ToggleSliderEstado = () => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.botonContextual(page).click();
        await ClientesTargets.opcionToggleEstado(page).locator('.v-switch label.switch').click();
        await ClientesTargets.botonContextual(page).click();
        await esperarCargaOverlay(page).catch(() => {});
    };
    fn.displayName = 'Toggle slider estado';
    return fn;
};
