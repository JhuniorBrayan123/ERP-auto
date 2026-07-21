import {expect, test} from '@fixtures/clientes-proveedores/clientes.fixture';
import {CrearCliente} from '@screenplay/tasks/clientes-proveedores/clientes/CrearCliente';
import {
    AbrirAccionContextualCliente,
    BuscarClienteEnListado
} from '@screenplay/tasks/clientes-proveedores/clientes/BuscarCliente';
import {ToggleSliderEstado} from '@screenplay/tasks/clientes-proveedores/clientes/ToggleEstadoCliente';
import {NavegarACajaPos} from '@screenplay/tasks/cross-modules/NavegarA';
import {BuscarClienteEnCaja} from '@screenplay/tasks/cross-modules/BuscarEntidadPos';
import {generarClienteDNI} from '@data/clientes-proveedores/clientes.data';
import {PosTargets} from '@screenplay/targets/cross-modules/PosTargets';

test.describe('IN-01 | Integración Cliente - Caja', {tag: ['@integracion', '@caja', '@clientes']}, () => {

    test('SC-01: Comportamiento de cliente inactivo, inexistente y activo en caja @IN-01.1', async ({
                                                                                                        cliente,
                                                                                                        page
                                                                                                    }) => {

        const datos = generarClienteDNI();
        await cliente.realiza(CrearCliente(datos));

        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(ToggleSliderEstado());

        await cliente.realiza(NavegarACajaPos());

        await cliente.realiza(BuscarClienteEnCaja(datos.numeroDocumento));
        await expect(PosTargets.mensajePersonaNoEncontrada(page)).toBeVisible();

        await cliente.realiza(BuscarClienteEnCaja('888888888888'));
        await expect(PosTargets.mensajePersonaNoEncontrada(page)).toBeVisible();

        await page.goto('/punto-venta/entidades/clientes');
        await page.waitForLoadState('networkidle').catch(() => {
        });
        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(ToggleSliderEstado());

        await cliente.realiza(NavegarACajaPos());
        await cliente.realiza(BuscarClienteEnCaja(datos.numeroDocumento));

        await expect(PosTargets.opcionDropdownPersona(page, datos.numeroDocumento)).toBeVisible();
        await PosTargets.opcionDropdownPersona(page, datos.numeroDocumento).click();


        await expect(page.locator('main')).toContainText(datos.numeroDocumento);
    });
});
