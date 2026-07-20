import {test as base, expect} from '@playwright/test';
import {Cajero} from '@actors/cajero';
import {ConductoresTargets} from '@screenplay/targets/clientes-proveedores/ConductoresTargets';
import {esperarCargaOverlay} from '@utils/wait-helpers';

type ConductoresFixtures = {
    conductorActor: Cajero; // Reutilizamos Cajero para la sesión
    conductorListo: void;
};

export const test = base.extend<ConductoresFixtures>({
    conductorActor: async ({page, conductorListo: _}, use) => {
        await use(Cajero.con(page));
    },

    conductorListo: [async ({page}, use) => {
        // Navegar al módulo Conductores
        await page.goto('/punto-venta/entidades/conductores');
        await page.waitForLoadState('networkidle').catch(() => {});
        await esperarCargaOverlay(page).catch(() => {});

        // Esperar a que el listado esté listo
        await ConductoresTargets.inputBuscar(page).waitFor({state: 'visible', timeout: 15_000});

        await use();

        // Cleanup: Asegurar que los modales o paneles estén cerrados
        const btnCerrarModal = ConductoresTargets.btnCerrarModal(page);
        if (await btnCerrarModal.isVisible({timeout: 500}).catch(() => false)) {
            await btnCerrarModal.click().catch(() => {});
        }
    }, {auto: true}],
});

export {expect} from '@playwright/test';
