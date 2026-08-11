import { test, expect } from '@fixtures/clientes-proveedores/conductores.fixture';
import {
    CrearConductor,
    CerrarModalExitoConductor,
} from '@screenplay/tasks/clientes-proveedores/conductores/CrearConductor';
import {
    BuscarConductorEnListado,
    ValidarSinResultados,
    AbrirAccionContextualConductor,
} from '@screenplay/tasks/clientes-proveedores/conductores/BuscarConductor';
import {
    ClickEliminarConfirmar,
} from '@screenplay/tasks/clientes-proveedores/conductores/EliminarConductor';
import { generarConductorDNI } from '@data/clientes-proveedores/conductores.data';
import { CuerpoContieneTexto } from '@screenplay/questions/clientes-proveedores/ClienteQuestions';

test.describe('CD-05 | Eliminación de Conductor', { tag: ['@conductores', '@eliminacion', '@CD-05'] }, () => {

    test('CD-05.1: Eliminar conductor', async ({ conductorActor, page }) => {
        const datosConductor = generarConductorDNI();

        
        await conductorActor.realiza(CrearConductor(datosConductor));
        
        await conductorActor.realiza(BuscarConductorEnListado(datosConductor.numeroDocumento));
        await conductorActor.realiza(AbrirAccionContextualConductor('Eliminar conductor'));
        await conductorActor.realiza(ClickEliminarConfirmar());
        await conductorActor.realiza(CerrarModalExitoConductor());
        await conductorActor.realiza(BuscarConductorEnListado(datosConductor.numeroDocumento));
        const sinResultados = await conductorActor.pregunta(ValidarSinResultados());
        expect(sinResultados).toBe(true);
    });
});
