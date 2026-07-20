import {test, expect} from '@fixtures/clientes-proveedores/conductores.fixture';
import {CrearConductor, CerrarModalExitoConductor} from '@screenplay/tasks/clientes-proveedores/conductores/CrearConductor';
import {BuscarConductorEnListado, AbrirAccionContextualConductor} from '@screenplay/tasks/clientes-proveedores/conductores/BuscarConductor';
import {EditarNombreConductor, ClickGuardarCambiosConductor} from '@screenplay/tasks/clientes-proveedores/conductores/EditarConductor';
import {
    ConductorVisibleEnListado,
    MensajeEdicionConductorExitosaVisible,
    BitacoraConductorContieneAccion,
} from '@screenplay/questions/clientes-proveedores/ConductorQuestions';
import {generarConductorPasaporte} from '@data/clientes-proveedores/conductores.data';
import {ConductoresTargets} from '@screenplay/targets/clientes-proveedores/ConductoresTargets';

test.describe('CO-02 | Edición de Conductores', {tag: ['@conductores', '@edicion']}, () => {

    test('SC-01: Editar nombre del conductor y visualizar bitácora @CO-02.1', async ({conductorActor, page}) => {
        // Arrange
        const datos = generarConductorPasaporte();
        await conductorActor.realiza(CrearConductor(datos));
        await conductorActor.realiza(BuscarConductorEnListado(datos.numeroDocumento));

        // Act
        await conductorActor.realiza(AbrirAccionContextualConductor('Editar conductor'));

        const nombreEditado = `${datos.nombreRazonSocial}-editado`;
        await conductorActor.realiza(EditarNombreConductor(nombreEditado));
        
        await conductorActor.realiza(ClickGuardarCambiosConductor());

        // Assert: Mensaje de éxito
        await conductorActor.realiza(MensajeEdicionConductorExitosaVisible());
        await conductorActor.realiza(CerrarModalExitoConductor());

        // Assert: Nombre actualizado en listado
        await conductorActor.realiza(BuscarConductorEnListado(datos.numeroDocumento));
        await conductorActor.realiza(ConductorVisibleEnListado(nombreEditado));

        // Assert: Bitácora
        await conductorActor.realiza(AbrirAccionContextualConductor('Ver bitácora'));
        await ConductoresTargets.pestaniaBitacora(page, 'Actualización').click();
        
        await conductorActor.realiza(BitacoraConductorContieneAccion(`ahora: ${nombreEditado}`));
        
        await ConductoresTargets.btnCerrarDrape(page).click();
    });
});
