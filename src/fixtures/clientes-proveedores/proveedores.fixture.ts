import {test as base, expect} from '@playwright/test';
import {Cajero} from '@actors/cajero';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';
import {esperarCargaOverlay} from '@utils/wait-helpers';

type ProveedoresFixtures = {
    proveedorActor: Cajero; // Reutilizamos el actor Cajero (o comprador) ya que la sesión/login es igual
    proveedorListo: void;
};

export const test = base.extend<ProveedoresFixtures>({
    proveedorActor: async ({page, proveedorListo: _}, use) => {
        await use(Cajero.con(page));
    },

    proveedorListo: [async ({page}, use) => {
        // Navegar al módulo Proveedores vía sidebar o directo
        await page.goto('/punto-venta/entidades/proveedores');
        await page.waitForLoadState('networkidle').catch(() => {});
        await esperarCargaOverlay(page).catch(() => {});

        // Esperar a que el listado esté listo
        await ProveedoresTargets.inputBuscar(page).waitFor({state: 'visible', timeout: 15_000});

        await use();

        // Cleanup: Asegurar que los modales o paneles estén cerrados
        const btnCerrarModal = ProveedoresTargets.btnCerrarModal(page);
        if (await btnCerrarModal.isVisible({timeout: 500}).catch(() => false)) {
            await btnCerrarModal.click().catch(() => {});
        }
    }, {auto: true}],
});

export {expect} from '@playwright/test';
