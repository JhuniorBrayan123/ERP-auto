import {test, expect} from '@fixtures/clientes-proveedores/clientes.fixture';
import {CrearCliente} from '@screenplay/tasks/clientes-proveedores/clientes/CrearCliente';
import {BuscarClienteEnListado, AbrirAccionContextualCliente} from '@screenplay/tasks/clientes-proveedores/clientes/BuscarCliente';
import {ToggleSliderEstado} from '@screenplay/tasks/clientes-proveedores/clientes/ToggleEstadoCliente';
import {NavegarACajaPos} from '@screenplay/tasks/cross-modules/NavegarA';
import {BuscarClienteEnCaja} from '@screenplay/tasks/cross-modules/BuscarEntidadPos';
import {generarClienteDNI} from '@data/clientes-proveedores/clientes.data';
import {PosTargets} from '@screenplay/targets/cross-modules/PosTargets';

test.describe('IN-01 | Integración Cliente - Caja', {tag: ['@integracion', '@caja', '@clientes']}, () => {

    test('SC-01: Comportamiento de cliente inactivo, inexistente y activo en caja @IN-01.1', async ({cliente, page}) => {
        // 1. Arrange: Crear cliente
        const datos = generarClienteDNI();
        await cliente.realiza(CrearCliente(datos));

        // 2. Act: Desactivar cliente
        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(AbrirAccionContextualCliente('Desactivar cliente'));
        await cliente.realiza(ToggleSliderEstado());

        // 3. Act: Navegar a Caja POS (Caja abierta asumida / manejada por fixture o task)
        await cliente.realiza(NavegarACajaPos());

        // 4. Assert: Cliente INACTIVO no debe aparecer
        await cliente.realiza(BuscarClienteEnCaja(datos.numeroDocumento));
        await expect(PosTargets.mensajePersonaNoEncontrada(page)).toBeVisible();

        // 5. Assert: Cliente INEXISTENTE no debe aparecer
        await cliente.realiza(BuscarClienteEnCaja('888888888888'));
        await expect(PosTargets.mensajePersonaNoEncontrada(page)).toBeVisible();

        // 6. Act: Volver a Clientes y Activar
        await page.goto('/punto-venta/entidades/clientes');
        await page.waitForLoadState('networkidle').catch(() => {});
        
        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(AbrirAccionContextualCliente('Activar cliente'));
        await cliente.realiza(ToggleSliderEstado());

        // 7. Assert: Cliente ACTIVO debe aparecer en Caja
        await cliente.realiza(NavegarACajaPos());
        await cliente.realiza(BuscarClienteEnCaja(datos.numeroDocumento));
        
        // Debe aparecer en el dropdown
        await expect(PosTargets.opcionDropdownPersona(page, datos.numeroDocumento)).toBeVisible();
        await PosTargets.opcionDropdownPersona(page, datos.numeroDocumento).click();

        // Validamos que se seleccionó
        await expect(page.locator('main')).toContainText(datos.numeroDocumento);
    });
});
