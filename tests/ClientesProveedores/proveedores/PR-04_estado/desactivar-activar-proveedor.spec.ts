import {test, expect} from '@fixtures/clientes-proveedores/proveedores.fixture';
import {CrearProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/CrearProveedor';
import {BuscarProveedorEnListado} from '@screenplay/tasks/clientes-proveedores/proveedores/BuscarProveedor';
import {DesactivarProveedor, ToggleSliderEstadoProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/ToggleEstadoProveedor';
import {generarProveedorRUC} from '@data/clientes-proveedores/proveedores.data';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';

test.describe('PR-04 | Desactivar/Activar Proveedor', {tag: ['@proveedores', '@estado']}, () => {

    test('SC-01: Desactivar proveedor @PR-04.1', async ({proveedor, page}) => {
        const datos = generarProveedorRUC();
        await proveedor.realiza(CrearProveedor(datos));

        await proveedor.realiza(BuscarProveedorEnListado(datos.numeroDocumento));
        await proveedor.realiza(DesactivarProveedor());
        await expect(page.locator('tbody')).toContainText('INACTIVO');
    });

    test('SC-02: Activar proveedor @PR-04.2', async ({proveedor, page}) => {
        const datos = Object.assign(generarProveedorRUC(), {estado: 'Inactivo' as const});
        await proveedor.realiza(CrearProveedor(datos));

        await proveedor.realiza(BuscarProveedorEnListado(datos.numeroDocumento));
        await proveedor.realiza(ToggleSliderEstadoProveedor());
        await ProveedoresTargets.btnBorrarFiltros(page).click();
        await proveedor.realiza(BuscarProveedorEnListado(datos.numeroDocumento));
        await expect(page.locator('tbody')).toContainText('ACTIVO');
    });
});
