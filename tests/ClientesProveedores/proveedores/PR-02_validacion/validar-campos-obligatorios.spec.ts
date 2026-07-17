import {test, expect} from '@fixtures/clientes-proveedores/proveedores.fixture';
import {AbrirCrearProveedor, SeleccionarTipoDocProveedor, LlenarNumeroDocumentoProveedor, CambiarCodigoProveedorAManual, LlenarDireccionProveedor, LlenarTelefonoProveedor, LlenarEmailProveedor, ClickCrearProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/CrearProveedor';

test.describe('PR-02 | Validación de Campos Obligatorios', {tag: ['@proveedores', '@validacion']}, () => {

    test('SC-01: Validar nombre razón social obligatorio @PR-02.1', async ({proveedor, page}) => {
        await proveedor.realiza(AbrirCrearProveedor());
        await proveedor.realiza(SeleccionarTipoDocProveedor('RUC'));
        await proveedor.realiza(LlenarNumeroDocumentoProveedor('20123456789'));
        await proveedor.realiza(CambiarCodigoProveedorAManual('P99999'));
        await proveedor.realiza(LlenarDireccionProveedor('arequipa'));
        await proveedor.realiza(LlenarTelefonoProveedor('999999999'));
        await proveedor.realiza(LlenarEmailProveedor('test@test.com'));
        await proveedor.realiza(ClickCrearProveedor());

        await expect(page.locator('body')).toContainText('Campo obligatorio');
    });
});
