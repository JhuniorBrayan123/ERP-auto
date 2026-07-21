import {test} from '@fixtures/clientes-proveedores/conductores.fixture';
import {
    CerrarModalExitoConductor,
    CrearConductor
} from '@screenplay/tasks/clientes-proveedores/conductores/CrearConductor';
import {
    AbrirAccionContextualConductor,
    BuscarConductorEnListado
} from '@screenplay/tasks/clientes-proveedores/conductores/BuscarConductor';
import {
    ClickGuardarCambiosConductor,
    EditarNombreConductor
} from '@screenplay/tasks/clientes-proveedores/conductores/EditarConductor';
import {EliminarConductor} from '@screenplay/tasks/clientes-proveedores/conductores/EliminarConductor';
import {
    BitacoraConductorContieneAccion,
    ConductorVisibleEnListado,
    MensajeEdicionConductorExitosaVisible,
} from '@screenplay/questions/clientes-proveedores/ConductorQuestions';
import {generarConductorPasaporte} from '@data/clientes-proveedores/conductores.data';
import {ConductoresTargets} from '@screenplay/targets/clientes-proveedores/ConductoresTargets';

test.describe('CO-02 | Edición de Conductores', {tag: ['@conductores', '@edicion']}, () => {

    test('SC-01: Editar nombre del conductor y visualizar bitácora @CO-02.1', async ({conductorActor, page}) => {

        const datos = generarConductorPasaporte();
        await conductorActor.realiza(CrearConductor(datos));
        await conductorActor.realiza(BuscarConductorEnListado(datos.numeroDocumento));


        await conductorActor.realiza(AbrirAccionContextualConductor('Editar conductor'));

        const nombreEditado = `${datos.nombreRazonSocial}-editado`;
        await conductorActor.realiza(EditarNombreConductor(nombreEditado));
        await conductorActor.realiza(ClickGuardarCambiosConductor());
        await conductorActor.realiza(MensajeEdicionConductorExitosaVisible());
        await conductorActor.realiza(CerrarModalExitoConductor());
        await conductorActor.realiza(BuscarConductorEnListado(datos.numeroDocumento));
        await conductorActor.realiza(ConductorVisibleEnListado(nombreEditado));


        await conductorActor.realiza(AbrirAccionContextualConductor('Ver bitácora'));
        await ConductoresTargets.pestaniaBitacora(page, 'Actualización').click();

        await conductorActor.realiza(BitacoraConductorContieneAccion(`ahora: ${nombreEditado}`));

        await ConductoresTargets.btnCerrarDrape(page).click();
        
        await conductorActor.realiza(EliminarConductor(datos.numeroDocumento));
    });
});
