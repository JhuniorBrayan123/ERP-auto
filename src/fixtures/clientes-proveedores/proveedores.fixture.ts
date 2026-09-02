import {test as base, expect} from '@playwright/test';
import {Cajero} from '@actors/cajero';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';
import {esperarCargaOverlay, esperarCargaOverlaySiVisible} from '@utils/wait-helpers';

type ProveedoresFixtures = {
    proveedorActor: Cajero; 
    proveedorListo: void;
};

export const test = base.extend<ProveedoresFixtures>({
    proveedorActor: async ({page, proveedorListo: _}, use) => {
        await use(Cajero.con(page));
    },

    proveedorListo: [async ({page}, use) => {
        
        await page.goto('/punto-venta/entidades/proveedores');
        await page.waitForLoadState('networkidle').catch(() => {});
        await esperarCargaOverlaySiVisible(page).catch(() => {});

        
        await ProveedoresTargets.inputBuscar(page).waitFor({state: 'visible', timeout: 15_000});

        await use();

        
        const btnCerrarModal = ProveedoresTargets.btnCerrarModal(page);
        if (await btnCerrarModal.isVisible({timeout: 500}).catch(() => false)) {
            await btnCerrarModal.click().catch(() => {});
        }
    }, {auto: true}],
});

export {expect} from '@playwright/test';
