import {test as base, expect} from '@playwright/test';
import {Cajero} from '@actors/cajero';
import {VendedoresTargets} from '@screenplay/targets/clientes-proveedores/VendedoresTargets';
import {esperarCargaOverlay} from '@utils/wait-helpers';

type VendedoresFixtures = {
    vendedor: Cajero;
};

export const test = base.extend<VendedoresFixtures>({
    vendedor: async ({page}, use) => {
        await page.goto('/punto-venta/sistema/vendedores');
        await page.waitForLoadState('networkidle').catch(() => {});
        await esperarCargaOverlay(page).catch(() => {});
        await VendedoresTargets.inputBuscar(page).waitFor({state: 'visible', timeout: 15_000}).catch(async () => {
            await page.goto('/punto-venta/sistema/vendedores');
            await esperarCargaOverlay(page).catch(() => {});
            await VendedoresTargets.inputBuscar(page).waitFor({state: 'visible', timeout: 15_000});
        });
        await use(Cajero.con(page));
    },
});

export {expect} from '@playwright/test';
