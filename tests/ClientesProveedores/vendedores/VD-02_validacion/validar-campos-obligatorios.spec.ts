import {test, expect} from '@fixtures/clientes-proveedores/vendedores.fixture';
import {AbrirCrearVendedor, SeleccionarTipoDocVendedor, LlenarNumeroDocumentoVendedor, CambiarCodigoVendedorAManual, LlenarDireccionVendedor, LlenarTelefonoVendedor, LlenarEmailVendedor, ClickCrearVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';

test.describe('VD-02 | Validación de Campos Obligatorios', {tag: ['@vendedores', '@validacion']}, () => {

    test('SC-01: Validar nombre razón social obligatorio @VD-02.1', async ({vendedor, page}) => {
        await vendedor.realiza(AbrirCrearVendedor());
        await vendedor.realiza(SeleccionarTipoDocVendedor('RUC'));
        await vendedor.realiza(LlenarNumeroDocumentoVendedor('20123456789'));
        await vendedor.realiza(CambiarCodigoVendedorAManual('V99999'));
        await vendedor.realiza(LlenarDireccionVendedor('arequipa'));
        await vendedor.realiza(LlenarTelefonoVendedor('999999999'));
        await vendedor.realiza(LlenarEmailVendedor('test@test.com'));
        await vendedor.realiza(ClickCrearVendedor());

        await expect(page.locator('body')).toContainText('Campo obligatorio');
    });
});
