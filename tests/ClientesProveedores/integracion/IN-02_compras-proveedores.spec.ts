import {expect, test} from '@fixtures/clientes-proveedores/proveedores.fixture';
import {CrearProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/CrearProveedor';
import {
    AbrirAccionContextualProveedor,
    BuscarProveedorEnListado
} from '@screenplay/tasks/clientes-proveedores/proveedores/BuscarProveedor';
import {EliminarProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/EliminarProveedor';
import {ToggleSliderEstadoProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/ToggleEstadoProveedor';
import {NavegarANuevaCompra} from '@screenplay/tasks/cross-modules/NavegarA';
import {BuscarProveedorEnCompra} from '@screenplay/tasks/cross-modules/BuscarEntidadPos';
import {generarProveedorRUC} from '@data/clientes-proveedores/proveedores.data';
import {ComprasTargets} from '@screenplay/targets/cross-modules/ComprasTargets';
import {PosTargets} from '@screenplay/targets/cross-modules/PosTargets';

test.describe('IN-02 | Integración Proveedor - Compras', {tag: ['@integracion', '@compras', '@proveedores']}, () => {

    test('SC-01: Comportamiento de proveedor inactivo y activo en compras @IN-02.1', async ({proveedorActor, page}) => {

        const datos = generarProveedorRUC();
        await proveedorActor.realiza(CrearProveedor(datos));


        await proveedorActor.realiza(BuscarProveedorEnListado(datos.numeroDocumento));
        await proveedorActor.realiza(AbrirAccionContextualProveedor('Desactivar proveedor'));
        await proveedorActor.realiza(ToggleSliderEstadoProveedor());


        await proveedorActor.realiza(NavegarANuevaCompra());

        await proveedorActor.realiza(BuscarProveedorEnCompra(datos.numeroDocumento));
        await expect(ComprasTargets.mensajeProveedorNoEncontrado(page)).toBeVisible();


        await page.goto('/punto-venta/entidades/proveedores');
        await page.waitForLoadState('networkidle').catch(() => {
        });

        await proveedorActor.realiza(BuscarProveedorEnListado(datos.numeroDocumento));
        await proveedorActor.realiza(AbrirAccionContextualProveedor('Activar proveedor'));
        await proveedorActor.realiza(ToggleSliderEstadoProveedor());


        await proveedorActor.realiza(NavegarANuevaCompra());
        await proveedorActor.realiza(BuscarProveedorEnCompra(datos.numeroDocumento));

        await expect(PosTargets.opcionDropdownPersona(page, datos.numeroDocumento)).toBeVisible();
        await PosTargets.opcionDropdownPersona(page, datos.numeroDocumento).click();


        await page.goto('/punto-venta/entidades/proveedores');
        await page.waitForLoadState('networkidle').catch(() => {
        });
        await proveedorActor.realiza(EliminarProveedor(datos.numeroDocumento));
    });
});
