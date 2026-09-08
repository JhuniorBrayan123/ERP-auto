import {expect, test as base} from '@playwright/test';
import {Cajero} from '@actors/cajero';
import {ClientesTargets} from '@screenplay/targets/clientes-proveedores/ClientesTargets';
import {esperarCargaOverlaySiVisible} from '@utils/wait-helpers';

type ClientesFixtures = {
    cliente: Cajero;
    clienteListo: void;
};

export const test = base.extend<ClientesFixtures>({
    cliente: async ({page, clienteListo: _}, use) => {
        await use(Cajero.con(page));
    },

    clienteListo: [async ({page}, use) => {
        await page.goto('/');
        await page.getByText('Clientes y proveedores').click();
        await page.locator('[id="nvg_selects_cmp-header-selects_select:select-module-501-item-5001"]').click()
        await page.waitForLoadState('networkidle').catch(() => {
        });
        await esperarCargaOverlaySiVisible(page).catch(() => {
        });


        await ClientesTargets.inputBuscar(page).waitFor({state: 'visible', timeout: 15_000}).catch(async () => {

            await page.goto('/punto-venta/entidades/clientes');
            await esperarCargaOverlaySiVisible(page).catch(() => {
            });
            await ClientesTargets.inputBuscar(page).waitFor({state: 'visible', timeout: 15_000});
        });

        await use();

        
        const btnAtras = ClientesTargets.btnAtras(page);
        if (await btnAtras.isVisible({timeout: 500}).catch(() => false)) {
            await btnAtras.click().catch(() => {
            });
        }
    }, {auto: true}],
});

export {expect} from '@playwright/test';
