import { test } from '@fixtures/clientes-proveedores/conductores.fixture';
import { CrearConductor } from '@screenplay/tasks/clientes-proveedores/conductores/CrearConductor';
import {
    AbrirAccionContextualConductor,
    BuscarConductorEnListado,
} from '@screenplay/tasks/clientes-proveedores/conductores/BuscarConductor';
import {
    ToggleSliderEstadoConductor,
} from '@screenplay/tasks/clientes-proveedores/conductores/ToggleEstadoConductor';
import { generarConductorDNI } from '@data/clientes-proveedores/conductores.data';
import { EliminarConductor } from '@screenplay/tasks/clientes-proveedores/conductores/EliminarConductor';
import { EstadoConductorEnListado } from '@screenplay/questions/clientes-proveedores/ConductorQuestions';

test.describe('CD-04 | Desactivar / Activar Conductor', { tag: ['@conductores', '@estado', '@CD-04'] }, () => {

    test('CD-04.1: Desactivar conductor', async ({ conductorActor, page }) => {
        const datosConductor = generarConductorDNI();

        await conductorActor.realiza(CrearConductor(datosConductor));

        await conductorActor.realiza(BuscarConductorEnListado(datosConductor.numeroDocumento));
        await conductorActor.realiza(AbrirAccionContextualConductor('Desactivar conductor'));
        await conductorActor.realiza(ToggleSliderEstadoConductor());

        await conductorActor.realiza(BuscarConductorEnListado(datosConductor.numeroDocumento));
        await conductorActor.realiza(EstadoConductorEnListado('INACTIVO'));

        await conductorActor.realiza(EliminarConductor(datosConductor.numeroDocumento));
    });

    test('CD-04.2: Activar conductor', async ({ conductorActor, page }) => {
        const datosConductor = generarConductorDNI();

        await conductorActor.realiza(CrearConductor(datosConductor));

        await conductorActor.realiza(BuscarConductorEnListado(datosConductor.numeroDocumento));
        await conductorActor.realiza(AbrirAccionContextualConductor('Desactivar conductor'));
        await conductorActor.realiza(ToggleSliderEstadoConductor());

        await conductorActor.realiza(BuscarConductorEnListado(datosConductor.numeroDocumento));
        await conductorActor.realiza(AbrirAccionContextualConductor('Activar conductor'));
        await conductorActor.realiza(ToggleSliderEstadoConductor());

        await conductorActor.realiza(BuscarConductorEnListado(datosConductor.numeroDocumento));
        await conductorActor.realiza(EstadoConductorEnListado('ACTIVO'));

        await conductorActor.realiza(EliminarConductor(datosConductor.numeroDocumento));
    });
});
