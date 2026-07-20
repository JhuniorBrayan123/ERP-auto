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
        
        const datos = generarVendedorDNI();
        await vendedorActor.realiza(CrearVendedor(datos));

        
        await vendedorActor.realiza(BuscarVendedorEnListado(datos.numeroDocumento));
        await vendedorActor.realiza(AbrirAccionContextualVendedor('Desactivar vendedor'));
        await vendedorActor.realiza(ToggleSliderEstadoVendedor());

        
        await vendedorActor.realiza(NavegarACajaPos());

        
        await vendedorActor.realiza(BuscarVendedorEnCaja(datos.numeroDocumento));
        await expect(PosTargets.mensajeVendedorNoEncontrado(page)).toBeVisible();

        
        await page.goto('/punto-venta/entidades/vendedores');
        await page.waitForLoadState('networkidle').catch(() => {});
        
        await vendedorActor.realiza(BuscarVendedorEnListado(datos.numeroDocumento));
        await vendedorActor.realiza(AbrirAccionContextualVendedor('Activar vendedor'));
        await vendedorActor.realiza(ToggleSliderEstadoVendedor());

        
        await vendedorActor.realiza(NavegarACajaPos());
        await vendedorActor.realiza(BuscarVendedorEnCaja(datos.numeroDocumento));
        
        await expect(PosTargets.opcionDropdownPersona(page, datos.numeroDocumento)).toBeVisible();
        await PosTargets.opcionDropdownPersona(page, datos.numeroDocumento).click();

        await PosTargets.btnGuardarDatosVenta(page).click();
    });
});
