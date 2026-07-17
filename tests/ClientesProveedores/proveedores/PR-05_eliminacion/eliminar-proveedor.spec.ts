import {test, expect} from '@fixtures/clientes-proveedores/proveedores.fixture';
import {CrearProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/CrearProveedor';
import {BuscarProveedorEnListado} from '@screenplay/tasks/clientes-proveedores/proveedores/BuscarProveedor';
import {ClickEliminarConfirmarProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/EliminarProveedor';
import {generarProveedorRUC} from '@data/clientes-proveedores/proveedores.data';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';

test.describe('PR-05 | Eliminación de Proveedores', {tag: ['@proveedores', '@eliminacion']}, () => {

    test('SC-01: Eliminar proveedor @PR-05.1', async ({proveedor, page}) => {
        const datos = generarProveedorRUC();
        await proveedor.realiza(CrearProveedor(datos));

        await proveedor.realiza(BuscarProveedorEnListado(datos.numeroDocumento));
        await ProveedoresTargets.botonContextual(page).click();
        await page.getByText('Eliminar proveedor').click();
        await proveedor.realiza(ClickEliminarConfirmarProveedor());

        await expect(page.locator('body')).toContainText('El proveedor fue eliminado exitosamente');
        await ProveedoresTargets.btnCerrarModal(page).click();
        await ProveedoresTargets.btnBorrarFiltros(page).click();
        await proveedor.realiza(BuscarProveedorEnListado(datos.numeroDocumento));
        await expect(page.getByRole('cell')).toContainText('NO HAY RESULTADOS');
    });
});
