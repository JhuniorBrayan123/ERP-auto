import {test as base, expect} from '@playwright/test';
import {Cajero} from '@actors/cajero';
import {ClientesTargets} from '@screenplay/targets/clientes-proveedores/ClientesTargets';
import {esperarCargaOverlay} from '@utils/wait-helpers';

type ClientesFixtures = {
    cliente: Cajero;
    clienteListo: void;
};

export const test = base.extend<ClientesFixtures>({
    cliente: async ({page, clienteListo: _}, use) => {
        await use(Cajero.con(page));
    },

    clienteListo: [async ({page}, use) => {
        // Navegar al módulo Clientes vía sidebar
        await page.goto('/');
        await page.getByText('Clientes y proveedores').click();
        await page.getByText('Clientes', {exact: true}).click();
        await page.waitForLoadState('networkidle').catch(() => {});
        await esperarCargaOverlay(page).catch(() => {});

        // Esperar a que el listado esté listo
        await ClientesTargets.inputBuscar(page).waitFor({state: 'visible', timeout: 15_000}).catch(async () => {
            // Fallback: navegación directa si la SPA no ruteó correctamente
            await page.goto('/punto-venta/entidades/clientes');
            await esperarCargaOverlay(page).catch(() => {});
            await ClientesTargets.inputBuscar(page).waitFor({state: 'visible', timeout: 15_000});
        });

        await use();

        // Cleanup
        const btnAtras = ClientesTargets.btnAtras(page);
        if (await btnAtras.isVisible({timeout: 500}).catch(() => false)) {
            await btnAtras.click().catch(() => {});
        }
    }, {auto: true}],
});

export {expect} from '@playwright/test';
