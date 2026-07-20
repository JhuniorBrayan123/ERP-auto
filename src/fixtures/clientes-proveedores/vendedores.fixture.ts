import {test as base, expect} from '@playwright/test';
import {Cajero} from '@actors/cajero';
import {VendedoresTargets} from '@screenplay/targets/clientes-proveedores/VendedoresTargets';
import {esperarCargaOverlay} from '@utils/wait-helpers';

type VendedoresFixtures = {
    vendedorActor: Cajero; 
    vendedorListo: void;
};

export const test = base.extend<VendedoresFixtures>({
    vendedorActor: async ({page, vendedorListo: _}, use) => {
        await use(Cajero.con(page));
    },

    vendedorListo: [async ({page}, use) => {
        
        await page.goto('/punto-venta/entidades/vendedores');
        await page.waitForLoadState('networkidle').catch(() => {});
        await esperarCargaOverlay(page).catch(() => {});

        
        await VendedoresTargets.inputBuscar(page).waitFor({state: 'visible', timeout: 15_000});

        await use();

        
        const btnCerrarModal = VendedoresTargets.btnCerrarModal(page);
        if (await btnCerrarModal.isVisible({timeout: 500}).catch(() => false)) {
            await btnCerrarModal.click().catch(() => {});
        }
    }, {auto: true}],
});

export {expect} from '@playwright/test';
