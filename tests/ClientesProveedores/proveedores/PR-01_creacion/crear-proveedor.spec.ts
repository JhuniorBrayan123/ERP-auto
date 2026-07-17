import {test, expect} from '@fixtures/clientes-proveedores/proveedores.fixture';
import {CrearProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/CrearProveedor';
import {generarProveedorRUC, generarProveedorConCampoAdicional} from '@data/clientes-proveedores/proveedores.data';

test.describe('PR-01 | Creación de Proveedores', {tag: ['@proveedores', '@creacion']}, () => {

    test('SC-01: Crear proveedor RUC @PR-01.1', async ({proveedor}) => {
        const datos = generarProveedorRUC();
        await proveedor.realiza(CrearProveedor(datos));
    });

    test('SC-02: Crear proveedor con campo adicional @PR-01.2', async ({proveedor}) => {
        const datos = generarProveedorConCampoAdicional();
        await proveedor.realiza(CrearProveedor(datos));
    });
});
