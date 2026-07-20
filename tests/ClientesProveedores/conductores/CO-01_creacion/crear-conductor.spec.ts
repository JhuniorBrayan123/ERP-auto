import {test, expect} from '@fixtures/clientes-proveedores/conductores.fixture';
import {CrearConductor, CerrarModalExitoConductor, LlenarFormularioBasicoConductor} from '@screenplay/tasks/clientes-proveedores/conductores/CrearConductor';
import {BuscarConductorEnListado, AbrirAccionContextualConductor} from '@screenplay/tasks/clientes-proveedores/conductores/BuscarConductor';
import {CancelarCreacionConductor} from '@screenplay/tasks/clientes-proveedores/conductores/EditarConductor';
import {
    ConductorVisibleEnListado,
    MensajeCreacionConductorExitosaVisible,
    MensajeErrorCampoObligatorioConductor,
    MensajeErrorNumericoDigitos,
    MensajeSinGuiasVisible,
} from '@screenplay/questions/clientes-proveedores/ConductorQuestions';
import {generarConductorDNI, generarConductorPasaporte} from '@data/clientes-proveedores/conductores.data';
import {ConductoresTargets} from '@screenplay/targets/clientes-proveedores/ConductoresTargets';

test.describe('CO-01 | Creación de Conductores', {tag: ['@conductores', '@creacion']}, () => {

    test('SC-01: Crear conductor válido con licencia y zona de transporte @CO-01.1', async ({conductorActor, page}) => {
        // Arrange
        const datos = generarConductorDNI();

        // Act
        await conductorActor.realiza(CrearConductor(datos));

        // Assert: Mensaje de éxito
        await conductorActor.realiza(MensajeCreacionConductorExitosaVisible());
        await conductorActor.realiza(CerrarModalExitoConductor());

        // Assert: Visualización en listado
        await conductorActor.realiza(BuscarConductorEnListado(datos.numeroDocumento));
        await conductorActor.realiza(ConductorVisibleEnListado(datos.nombreRazonSocial));

        // Validación post-creación: Verificar que no tiene guías asociadas
        await conductorActor.realiza(AbrirAccionContextualConductor('Ver guias a conductor'));
        await conductorActor.realiza(MensajeSinGuiasVisible());
        await ConductoresTargets.btnCerrarDrape(page).click();
    });

    test('SC-02: Validar campos obligatorios al crear conductor @CO-01.2', async ({conductorActor, page}) => {
        // Arrange: Datos parciales
        const datos = generarConductorPasaporte();
        datos.numeroDocumento = ''; // Forzamos vacío
        datos.nombreRazonSocial = '';
        datos.codigo = ''; // Forzamos vacío

        // Act
        await ConductoresTargets.btnCrearConductor(page).click();
        await conductorActor.realiza(LlenarFormularioBasicoConductor(datos));
        await ConductoresTargets.btnCrearConductorForm(page).click();

        // Assert: Validaciones de campos vacíos
        await conductorActor.realiza(MensajeErrorCampoObligatorioConductor());

        // Act: Intentar llenar solo una parte y fallar por dígitos de RUC (simulado, pero para conductores el codegen usa RUC para validar dígitos)
        await ConductoresTargets.inputRazonSocial(page).click();
        await ConductoresTargets.inputRazonSocial(page).fill('conductor-automatizado');
        
        await ConductoresTargets.selectTipoDocumento(page).click();
        await ConductoresTargets.opcionTipoDocumento(page, 'RUC').click();

        await ConductoresTargets.inputNumeroDocumento(page).click();
        await ConductoresTargets.inputNumeroDocumento(page).fill('01');
        
        // El framework evalúa al perder el foco o hacer click (por lo que validamos el mensaje inmediatamente)
        await conductorActor.realiza(MensajeErrorNumericoDigitos('11'));

        // Teardown
        await conductorActor.realiza(CancelarCreacionConductor());
    });
});
