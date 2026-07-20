import {test} from '@fixtures/clientes-proveedores/vendedores.fixture';
import {
    CerrarModalExitoVendedor,
    CrearVendedor,
    LlenarFormularioBasicoVendedor
} from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';
import {BuscarVendedorEnListado} from '@screenplay/tasks/clientes-proveedores/vendedores/BuscarVendedor';
import {EliminarVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/EliminarVendedor';
import {CancelarCreacionVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/EditarVendedor';
import {
    MensajeCreacionVendedorExitosaVisible,
    MensajeErrorCampoObligatorioVendedor,
    MensajeErrorNumericoDigitos,
    VendedorVisibleEnListado,
} from '@screenplay/questions/clientes-proveedores/VendedorQuestions';
import {generarVendedorDNI, generarVendedorRUC} from '@data/clientes-proveedores/vendedores.data';
import {VendedoresTargets} from '@screenplay/targets/clientes-proveedores/VendedoresTargets';

test.describe('VE-01 | Creación de Vendedores', {tag: ['@vendedores', '@creacion']}, () => {

    test('SC-01: Crear vendedor válido con metas y zona de ventas @VE-01.1', async ({vendedorActor}) => {

        const datos = generarVendedorDNI();
        await vendedorActor.realiza(CrearVendedor(datos));
        await vendedorActor.realiza(MensajeCreacionVendedorExitosaVisible());
        await vendedorActor.realiza(CerrarModalExitoVendedor());
        await vendedorActor.realiza(BuscarVendedorEnListado(datos.numeroDocumento));
        await vendedorActor.realiza(VendedorVisibleEnListado(datos.nombreRazonSocial));

        
        await vendedorActor.realiza(EliminarVendedor(datos.numeroDocumento));
    });

    test('SC-02: Validar campos obligatorios al crear vendedor @VE-01.2', async ({vendedorActor, page}) => {

        const datos = generarVendedorRUC();
        datos.numeroDocumento = ''; // Forzamos vacío
        datos.nombreRazonSocial = '';
        datos.codigo = ''; // Forzamos vacío
        
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


        await vendedorActor.realiza(MensajeErrorNumericoDigitos('11'));


        await vendedorActor.realiza(CancelarCreacionVendedor());
    });
});
