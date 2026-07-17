import {test, expect} from '@fixtures/clientes-proveedores/proveedores.fixture';
import {CrearProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/CrearProveedor';
import {BuscarProveedorEnListado} from '@screenplay/tasks/clientes-proveedores/proveedores/BuscarProveedor';
import {ClickGuardarCambiosProveedor, EditarNombreProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/EditarProveedor';
import {generarProveedorRUC} from '@data/clientes-proveedores/proveedores.data';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';

test.describe('PR-03 | Edición de Proveedores', {tag: ['@proveedores', '@edicion']}, () => {

    test('SC-01: Editar nombre y verificar en listado @PR-03.1', async ({proveedor, page}) => {
        const datos = generarProveedorRUC();
        await proveedor.realiza(CrearProveedor(datos));

        await proveedor.realiza(BuscarProveedorEnListado(datos.numeroDocumento));
        await ProveedoresTargets.botonContextual(page).click();
        await page.getByText('Editar proveedor').click();

        const nombreEditado = `${datos.nombreRazonSocial}-editado`;
        await proveedor.realiza(EditarNombreProveedor(nombreEditado));
        await proveedor.realiza(ClickGuardarCambiosProveedor());

        await expect(page.locator('body')).toContainText('Los cambios se guardaron exitosamente');
        await ProveedoresTargets.btnCerrarModal(page).click();
        await proveedor.realiza(BuscarProveedorEnListado(datos.numeroDocumento));
        await expect(ProveedoresTargets.tbody(page)).toContainText(nombreEditado);
    });
});
