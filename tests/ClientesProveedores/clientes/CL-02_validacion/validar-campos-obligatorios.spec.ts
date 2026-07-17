import {test, expect} from '@fixtures/clientes-proveedores/clientes.fixture';
import {
    AbrirCrearCliente,
    SeleccionarTipoDocCliente,
    LlenarNumeroDocumentoCliente,
    LlenarNombreRazonSocialCliente,
    CambiarCodigoAManual,
    LlenarDireccionCliente,
    LlenarTelefonoCliente,
    LlenarEmailCliente,
    ClickCrearCliente,
} from '@screenplay/tasks/clientes-proveedores/clientes/CrearCliente';
import {CuerpoContieneTexto} from '@screenplay/questions/clientes-proveedores/ClienteQuestions';

test.describe('CL-02 | Validación de Campos Obligatorios', {tag: ['@clientes', '@validacion']}, () => {

    test('SC-01: Validar campo código obligatorio @CL-02.1', async ({cliente, page}) => {
        await cliente.realiza(AbrirCrearCliente());
        await cliente.realiza(SeleccionarTipoDocCliente('RUC'));
        await cliente.realiza(LlenarNumeroDocumentoCliente('10101010101'));
        await cliente.realiza(LlenarNombreRazonSocialCliente('automatizado-ruc-cliente'));
        await cliente.realiza(CambiarCodigoAManual(''));
        await cliente.realiza(LlenarDireccionCliente('arequipa'));
        await cliente.realiza(LlenarTelefonoCliente('999999999'));
        await cliente.realiza(LlenarEmailCliente('srqapruebaserp2@gmail.com'));
        await cliente.realiza(ClickCrearCliente());

        await expect(page.locator('body')).toContainText('Campo obligatorio');
    });

    test('SC-02: Validar campo nombre/razón social obligatorio @CL-02.2', async ({cliente, page}) => {
        await cliente.realiza(AbrirCrearCliente());
        await cliente.realiza(SeleccionarTipoDocCliente('RUC'));
        await cliente.realiza(LlenarNumeroDocumentoCliente('10101010101'));
        await cliente.realiza(CambiarCodigoAManual('55555555'));
        await cliente.realiza(LlenarDireccionCliente('arequipa'));
        await cliente.realiza(LlenarTelefonoCliente('999999999'));
        await cliente.realiza(LlenarEmailCliente('srqapruebaserp2@gmail.com'));
        await cliente.realiza(ClickCrearCliente());

        await expect(page.locator('body')).toContainText('Campo obligatorio');
    });

    test('SC-03: Validar campo número documento obligatorio @CL-02.3', async ({cliente, page}) => {
        await cliente.realiza(AbrirCrearCliente());
        await cliente.realiza(SeleccionarTipoDocCliente('RUC'));
        await cliente.realiza(LlenarNombreRazonSocialCliente('automatizado-ruc-cliente'));
        await cliente.realiza(CambiarCodigoAManual('55555555'));
        await cliente.realiza(LlenarDireccionCliente('arequipa'));
        await cliente.realiza(LlenarTelefonoCliente('999999999'));
        await cliente.realiza(LlenarEmailCliente('srqapruebaserp2@gmail.com'));
        await cliente.realiza(ClickCrearCliente());

        await expect(page.locator('body')).toContainText('Campo obligatorio');
    });
});
