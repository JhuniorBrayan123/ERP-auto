import {test, expect} from '@fixtures/clientes-proveedores/vendedores.fixture';
import {CrearVendedor, CerrarModalExitoVendedor, LlenarFormularioBasicoVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';
import {BuscarVendedorEnListado} from '@screenplay/tasks/clientes-proveedores/vendedores/BuscarVendedor';
import {CancelarCreacionVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/EditarVendedor';
import {
    VendedorVisibleEnListado,
    MensajeCreacionVendedorExitosaVisible,
    MensajeErrorCampoObligatorioVendedor,
    MensajeErrorNumericoDigitos,
} from '@screenplay/questions/clientes-proveedores/VendedorQuestions';
import {generarVendedorDNI, generarVendedorRUC} from '@data/clientes-proveedores/vendedores.data';
import {VendedoresTargets} from '@screenplay/targets/clientes-proveedores/VendedoresTargets';

test.describe('VE-01 | Creación de Vendedores', {tag: ['@vendedores', '@creacion']}, () => {

    test('SC-01: Crear vendedor válido con metas y zona de ventas @VE-01.1', async ({vendedorActor}) => {
        // Arrange
        const datos = generarVendedorDNI();

        // Act
        await vendedorActor.realiza(CrearVendedor(datos));

        // Assert: Mensaje de éxito
        await vendedorActor.realiza(MensajeCreacionVendedorExitosaVisible());
        await vendedorActor.realiza(CerrarModalExitoVendedor());

        // Assert: Visualización en listado
        await vendedorActor.realiza(BuscarVendedorEnListado(datos.numeroDocumento));
        await vendedorActor.realiza(VendedorVisibleEnListado(datos.nombreRazonSocial));
    });

    test('SC-02: Validar campos obligatorios al crear vendedor @VE-01.2', async ({vendedorActor, page}) => {
        // Arrange: Datos parciales
        const datos = generarVendedorRUC();
        datos.numeroDocumento = ''; // Forzamos vacío
        datos.nombreRazonSocial = '';
        datos.codigo = ''; // Forzamos vacío

        // Act
        await VendedoresTargets.btnCrearVendedor(page).click();
        await vendedorActor.realiza(LlenarFormularioBasicoVendedor(datos));
        await VendedoresTargets.btnCrearVendedorForm(page).click();

        // Assert: Validaciones de campos vacíos
        await vendedorActor.realiza(MensajeErrorCampoObligatorioVendedor());

        // Act: Intentar llenar solo una parte y fallar por dígitos de RUC
        await VendedoresTargets.inputRazonSocial(page).click();
        await VendedoresTargets.inputRazonSocial(page).fill('editado-aceptado');
        
        await VendedoresTargets.inputNumeroDocumento(page).click();
        await VendedoresTargets.inputNumeroDocumento(page).fill('16565');
        
        // El framework evalúa al perder el foco o hacer click (por lo que validamos el mensaje inmediatamente)
        await vendedorActor.realiza(MensajeErrorNumericoDigitos('11'));

        // Teardown
        await vendedorActor.realiza(CancelarCreacionVendedor());
    });
});
