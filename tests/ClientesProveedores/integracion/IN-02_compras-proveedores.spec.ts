import {test, expect} from '@fixtures/clientes-proveedores/proveedores.fixture';
import {CrearProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/CrearProveedor';
import {BuscarProveedorEnListado, AbrirAccionContextualProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/BuscarProveedor';
import {ToggleSliderEstadoProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/ToggleEstadoProveedor';
import {NavegarANuevaCompra} from '@screenplay/tasks/cross-modules/NavegarA';
import {BuscarProveedorEnCompra} from '@screenplay/tasks/cross-modules/BuscarEntidadPos';
import {generarProveedorRUC} from '@data/clientes-proveedores/proveedores.data';
import {ComprasTargets} from '@screenplay/targets/cross-modules/ComprasTargets';
import {PosTargets} from '@screenplay/targets/cross-modules/PosTargets';

test.describe('IN-02 | Integración Proveedor - Compras', {tag: ['@integracion', '@compras', '@proveedores']}, () => {

    test('SC-01: Comportamiento de proveedor inactivo y activo en compras @IN-02.1', async ({proveedorActor, page}) => {
        // 1. Arrange: Crear proveedor
        const datos = generarProveedorRUC();
        await proveedorActor.realiza(CrearProveedor(datos));

        // 2. Act: Desactivar proveedor
        await proveedorActor.realiza(BuscarProveedorEnListado(datos.numeroDocumento));
        await proveedorActor.realiza(AbrirAccionContextualProveedor('Desactivar proveedor'));
        await proveedorActor.realiza(ToggleSliderEstadoProveedor());

        // 3. Act: Navegar a Nueva Compra
        await proveedorActor.realiza(NavegarANuevaCompra());

        // 4. Assert: Proveedor INACTIVO no debe aparecer
        await proveedorActor.realiza(BuscarProveedorEnCompra(datos.numeroDocumento));
        await expect(ComprasTargets.mensajeProveedorNoEncontrado(page)).toBeVisible();

        // 5. Act: Volver a Proveedores y Activar
        await page.goto('/punto-venta/entidades/proveedores');
        await page.waitForLoadState('networkidle').catch(() => {});
        
        await proveedorActor.realiza(BuscarProveedorEnListado(datos.numeroDocumento));
        await proveedorActor.realiza(AbrirAccionContextualProveedor('Activar proveedor'));
        await proveedorActor.realiza(ToggleSliderEstadoProveedor());

        // 6. Assert: Proveedor ACTIVO debe aparecer en Compras
        await proveedorActor.realiza(NavegarANuevaCompra());
        await proveedorActor.realiza(BuscarProveedorEnCompra(datos.numeroDocumento));
        
        await expect(PosTargets.opcionDropdownPersona(page, datos.numeroDocumento)).toBeVisible();
        await PosTargets.opcionDropdownPersona(page, datos.numeroDocumento).click();
    });
});
