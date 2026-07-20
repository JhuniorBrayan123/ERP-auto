import {test, expect} from '@fixtures/clientes-proveedores/vendedores.fixture';
import {CrearVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';
import {BuscarVendedorEnListado, AbrirAccionContextualVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/BuscarVendedor';
import {ToggleSliderEstadoVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/ToggleEstadoVendedor';
import {NavegarACajaPos} from '@screenplay/tasks/cross-modules/NavegarA';
import {BuscarVendedorEnCaja} from '@screenplay/tasks/cross-modules/BuscarEntidadPos';
import {generarVendedorDNI} from '@data/clientes-proveedores/vendedores.data';
import {PosTargets} from '@screenplay/targets/cross-modules/PosTargets';

test.describe('IN-04 | Integración Vendedor - Caja', {tag: ['@integracion', '@caja', '@vendedores']}, () => {

    test('SC-01: Comportamiento de vendedor inactivo y activo en datos de caja @IN-04.1', async ({vendedorActor, page}) => {
        // 1. Arrange: Crear vendedor
        const datos = generarVendedorDNI();
        await vendedorActor.realiza(CrearVendedor(datos));

        // 2. Act: Desactivar vendedor
        await vendedorActor.realiza(BuscarVendedorEnListado(datos.numeroDocumento));
        await vendedorActor.realiza(AbrirAccionContextualVendedor('Desactivar vendedor'));
        await vendedorActor.realiza(ToggleSliderEstadoVendedor());

        // 3. Act: Navegar a Caja POS
        await vendedorActor.realiza(NavegarACajaPos());

        // 4. Assert: Vendedor INACTIVO no debe aparecer
        await vendedorActor.realiza(BuscarVendedorEnCaja(datos.numeroDocumento));
        await expect(PosTargets.mensajeVendedorNoEncontrado(page)).toBeVisible();

        // 5. Act: Volver a Vendedores y Activar
        await page.goto('/punto-venta/entidades/vendedores');
        await page.waitForLoadState('networkidle').catch(() => {});
        
        await vendedorActor.realiza(BuscarVendedorEnListado(datos.numeroDocumento));
        await vendedorActor.realiza(AbrirAccionContextualVendedor('Activar vendedor'));
        await vendedorActor.realiza(ToggleSliderEstadoVendedor());

        // 6. Assert: Vendedor ACTIVO debe aparecer en Caja
        await vendedorActor.realiza(NavegarACajaPos());
        await vendedorActor.realiza(BuscarVendedorEnCaja(datos.numeroDocumento));
        
        await expect(PosTargets.opcionDropdownPersona(page, datos.numeroDocumento)).toBeVisible();
        await PosTargets.opcionDropdownPersona(page, datos.numeroDocumento).click();

        await PosTargets.btnGuardarDatosVenta(page).click();
    });
});
