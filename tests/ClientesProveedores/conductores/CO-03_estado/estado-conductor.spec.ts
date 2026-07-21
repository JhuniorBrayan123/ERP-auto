import {test} from '@fixtures/clientes-proveedores/conductores.fixture';
import {CrearConductor} from '@screenplay/tasks/clientes-proveedores/conductores/CrearConductor';
import {
    AbrirAccionContextualConductor,
    BuscarConductorEnListado
} from '@screenplay/tasks/clientes-proveedores/conductores/BuscarConductor';
import {ToggleSliderEstadoConductor} from '@screenplay/tasks/clientes-proveedores/conductores/ToggleEstadoConductor';
import {EliminarConductor} from '@screenplay/tasks/clientes-proveedores/conductores/EliminarConductor';
import {EstadoConductorEnListado,} from '@screenplay/questions/clientes-proveedores/ConductorQuestions';
import {generarConductorDNI} from '@data/clientes-proveedores/conductores.data';

test.describe('CO-03 | Estado de Conductores', {tag: ['@conductores', '@estado']}, () => {

    test('SC-01: Desactivar y reactivar conductor @CO-03.1', async ({conductorActor, page}) => {

        const datos = generarConductorDNI();
        await conductorActor.realiza(CrearConductor(datos));


        await conductorActor.realiza(BuscarConductorEnListado(datos.numeroDocumento));
        await conductorActor.realiza(AbrirAccionContextualConductor('Desactivar conductor'));
        await conductorActor.realiza(ToggleSliderEstadoConductor());
        await conductorActor.realiza(BuscarConductorEnListado(datos.numeroDocumento));
        await conductorActor.realiza(EstadoConductorEnListado('INACTIVO'));
        await conductorActor.realiza(AbrirAccionContextualConductor('Activar conductor'));
        await conductorActor.realiza(ToggleSliderEstadoConductor());
        await conductorActor.realiza(EstadoConductorEnListado('ACTIVO'));
        
        await conductorActor.realiza(EliminarConductor(datos.numeroDocumento));
    });
});
