import {test as base, expect} from '@playwright/test';
import {Cajero} from '@actors/cajero';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';
import {esperarCargaOverlay} from '@utils/wait-helpers';

type ProveedoresFixtures = {
    proveedor: Cajero;
};

export const test = base.extend<ProveedoresFixtures>({
    proveedor: async ({page}, use) => {
        await page.goto('/punto-venta/entidades/proveedores');
        await page.waitForLoadState('networkidle').catch(() => {});
        await esperarCargaOverlay(page).catch(() => {});
        await ProveedoresTargets.inputBuscar(page).waitFor({state: 'visible', timeout: 15_000}).catch(async () => {
            await page.goto('/punto-venta/entidades/proveedores');
            await esperarCargaOverlay(page).catch(() => {});
            await ProveedoresTargets.inputBuscar(page).waitFor({state: 'visible', timeout: 15_000});
        });
        await use(Cajero.con(page));
    },
});

export {expect} from '@playwright/test';
