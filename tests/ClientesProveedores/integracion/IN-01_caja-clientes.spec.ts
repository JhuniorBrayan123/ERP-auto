import {test, expect} from '@fixtures/clientes-proveedores/clientes.fixture';
import {Page} from '@playwright/test';
import {CrearCliente} from '@screenplay/tasks/clientes-proveedores/clientes/CrearCliente';
import {BuscarClienteEnCaja} from '@screenplay/tasks/cross-modules/BuscarEntidadPos';
import {CrearYDesactivarCliente, VerificarClienteNoEnCaja, ActivarClienteYVerificarEnCaja, LimpiarCliente} from '@screenplay/tasks/cross-modules/FlujoClienteCaja';
import {generarClienteDNI} from '@data/clientes-proveedores/clientes.data';
import {PosTargets} from '@screenplay/targets/cross-modules/PosTargets';

test.describe('IN-01 | Integración Cliente - Caja', {tag: ['@integracion', '@caja', '@clientes']}, () => {

    test('SC-01: Comportamiento de cliente inactivo, inexistente y activo en caja @IN-01.1', async ({cliente, page}) => {

        const datos = generarClienteDNI();
        await cliente.realiza(CrearCliente(datos));

        await cliente.realiza(CrearYDesactivarCliente(datos.numeroDocumento));
        await cliente.realiza(VerificarClienteNoEnCaja(datos.numeroDocumento));
        expect(cliente.pregunta(async (p: Page) => {
            const msg = PosTargets.mensajePersonaNoEncontrada(p);
            return msg.isVisible();
        })).toBeTruthy();

        await cliente.realiza(BuscarClienteEnCaja('888888888888'));
        expect(cliente.pregunta(async (p: Page) => {
            const msg = PosTargets.mensajePersonaNoEncontrada(p);
            return msg.isVisible();
        })).toBeTruthy();

        await cliente.realiza(ActivarClienteYVerificarEnCaja(datos.numeroDocumento));


        await expect(page.locator('main')).toContainText(datos.numeroDocumento);

        await cliente.realiza(LimpiarCliente(datos.numeroDocumento));
    });
});
