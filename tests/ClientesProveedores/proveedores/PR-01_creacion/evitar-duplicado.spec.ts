import {test, expect} from '@fixtures/clientes-proveedores/proveedores.fixture';
import {CrearProveedor, AbrirCrearProveedor, SeleccionarTipoDocProveedor, LlenarNumeroDocumentoProveedor, LlenarNombreRazonSocialProveedor, LlenarDireccionProveedor, LlenarTelefonoProveedor, LlenarEmailProveedor, ClickCrearProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/CrearProveedor';
import {generarProveedorRUC} from '@data/clientes-proveedores/proveedores.data';

test.describe('PR-01b | Evitar Proveedor Duplicado', {tag: ['@proveedores', '@duplicado']}, () => {

    test('SC-01: No permitir crear proveedor con mismo documento @PR-01.3', async ({proveedor, page}) => {
        const datos = generarProveedorRUC();
        await proveedor.realiza(CrearProveedor(datos));

        await proveedor.realiza(AbrirCrearProveedor());
        await proveedor.realiza(SeleccionarTipoDocProveedor(datos.tipoDocumento));
        await proveedor.realiza(LlenarNumeroDocumentoProveedor(datos.numeroDocumento));
        await proveedor.realiza(LlenarNombreRazonSocialProveedor(`${datos.nombreRazonSocial}-dup`));
        await proveedor.realiza(LlenarDireccionProveedor(datos.direccion));
        await proveedor.realiza(LlenarTelefonoProveedor(datos.telefono));
        await proveedor.realiza(LlenarEmailProveedor(datos.email));
        await proveedor.realiza(ClickCrearProveedor());

        await expect(page.locator('body')).toContainText(/ya esta registrado/);
    });
});
