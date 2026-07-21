import {test} from '@fixtures/clientes-proveedores/conductores.fixture';
import {
    CrearConductor,
    LlenarFormularioBasicoConductor
} from '@screenplay/tasks/clientes-proveedores/conductores/CrearConductor';
import {
    AbrirAccionContextualConductor,
    BuscarConductorEnListado
} from '@screenplay/tasks/clientes-proveedores/conductores/BuscarConductor';
import {CancelarCreacionConductor} from '@screenplay/tasks/clientes-proveedores/conductores/EditarConductor';
import {EliminarConductor} from '@screenplay/tasks/clientes-proveedores/conductores/EliminarConductor';
import {
    ConductorVisibleEnListado,
    MensajeErrorCampoObligatorioConductor,
    MensajeErrorNumericoDigitos,
    MensajeSinGuiasVisible,
} from '@screenplay/questions/clientes-proveedores/ConductorQuestions';
import {generarConductorDNI, generarConductorPasaporte} from '@data/clientes-proveedores/conductores.data';
import {ConductoresTargets} from '@screenplay/targets/clientes-proveedores/ConductoresTargets';

test.describe('CO-01 | Creación de Conductores', {tag: ['@conductores', '@creacion']}, () => {

    test('SC-01: Crear conductor válido con licencia y zona de transporte @CO-01.1', async ({conductorActor, page}) => {

        const datos = generarConductorDNI();
        await conductorActor.realiza(CrearConductor(datos));
        await conductorActor.realiza(BuscarConductorEnListado(datos.numeroDocumento));
        await conductorActor.realiza(ConductorVisibleEnListado(datos.nombreRazonSocial));
        await conductorActor.realiza(AbrirAccionContextualConductor('Ver guias a conductor'));
        await conductorActor.realiza(MensajeSinGuiasVisible());
        await ConductoresTargets.btnCerrarDrape(page).click();
        
        await conductorActor.realiza(EliminarConductor(datos.numeroDocumento));
    });

    test('SC-02: Validar campos obligatorios al crear conductor @CO-01.2', async ({conductorActor, page}) => {

        const datos = generarConductorPasaporte();
        datos.numeroDocumento = '';
        datos.nombreRazonSocial = '';
        datos.codigo = '';

        await ConductoresTargets.btnCrearConductor(page).click();
        await conductorActor.realiza(LlenarFormularioBasicoConductor(datos));
        await ConductoresTargets.btnCrearConductorForm(page).click();

        await conductorActor.realiza(MensajeErrorCampoObligatorioConductor());
        await ConductoresTargets.inputRazonSocial(page).click();
        await ConductoresTargets.inputRazonSocial(page).fill('conductor-automatizado');
        await ConductoresTargets.selectTipoDocumento(page).click();
        await ConductoresTargets.opcionTipoDocumento(page, 'RUC').click();

        await ConductoresTargets.inputNumeroDocumento(page).click();
        await ConductoresTargets.inputNumeroDocumento(page).fill('01');
        await conductorActor.realiza(MensajeErrorNumericoDigitos('11'));
        await conductorActor.realiza(CancelarCreacionConductor());
    });
});
