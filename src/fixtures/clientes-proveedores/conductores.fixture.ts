import {test as base, expect} from '@playwright/test';
import {Cajero} from '@actors/cajero';
import {ConductoresTargets} from '@screenplay/targets/clientes-proveedores/ConductoresTargets';
import {esperarCargaOverlay} from '@utils/wait-helpers';

type ConductoresFixtures = {
    conductor: Cajero;
};

export const test = base.extend<ConductoresFixtures>({
    conductor: async ({page}, use) => {
        await page.goto('/punto-venta/entidades/conductores');
        await page.waitForLoadState('networkidle').catch(() => {});
        await esperarCargaOverlay(page).catch(() => {});
        await ConductoresTargets.inputBuscar(page).waitFor({state: 'visible', timeout: 15_000}).catch(async () => {
            await page.goto('/punto-venta/entidades/conductores');
            await esperarCargaOverlay(page).catch(() => {});
            await ConductoresTargets.inputBuscar(page).waitFor({state: 'visible', timeout: 15_000});
        });
        await use(Cajero.con(page));
    },
});

export {expect} from '@playwright/test';
