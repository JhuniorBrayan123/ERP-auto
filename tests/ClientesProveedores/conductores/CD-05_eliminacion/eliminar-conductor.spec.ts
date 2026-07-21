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
import { generarConductor } from '@data/clientes-proveedores/conductores.data';
import { CuerpoContieneTexto } from '@screenplay/questions/clientes-proveedores/ClienteQuestions';

test.describe('CD-05 | Eliminación de Conductor', { tag: ['@conductores', '@eliminacion', '@CD-05'] }, () => {

    test('CD-05.1: Eliminar conductor', async ({ conductor, page }) => {
        const datosConductor = generarConductor();

        // Crear conductor
        await conductor.realiza(CrearConductor(datosConductor));
        await conductor.realiza(CerrarModalExitoConductor());

        // Buscar y eliminar
        await conductor.realiza(BuscarConductorEnListado(datosConductor.numeroDocumento));
        await conductor.realiza(AbrirAccionContextualConductor('Eliminar'));
        await conductor.realiza(ClickEliminarConfirmar());

        // Validar mensaje de éxito
        const hayExito = await conductor.pregunta(CuerpoContieneTexto('eliminado'));
        expect(hayExito).toBe(true);

        // Validar que ya no aparece en el listado
        await conductor.realiza(BuscarConductorEnListado(datosConductor.numeroDocumento));
        const sinResultados = await conductor.pregunta(ValidarSinResultados());
        expect(sinResultados).toBe(true);
    });
});
