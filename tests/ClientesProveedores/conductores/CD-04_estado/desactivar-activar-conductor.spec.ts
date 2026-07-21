import { test, expect } from '@fixtures/clientes-proveedores/conductores.fixture';
import {
    CrearConductor,
    CerrarModalExitoConductor,
} from '@screenplay/tasks/clientes-proveedores/conductores/CrearConductor';
import {
    BuscarConductorEnListado,
} from '@screenplay/tasks/clientes-proveedores/conductores/BuscarConductor';
import {
    ToggleSliderEstado,
} from '@screenplay/tasks/clientes-proveedores/conductores/ToggleEstadoConductor';
import { generarConductor } from '@data/clientes-proveedores/conductores.data';
import { CuerpoContieneTexto } from '@screenplay/questions/clientes-proveedores/ClienteQuestions';

test.describe('CD-04 | Desactivar / Activar Conductor', { tag: ['@conductores', '@estado', '@CD-04'] }, () => {

    test('CD-04.1: Desactivar conductor', async ({ conductor, page }) => {
        const datosConductor = generarConductor();

        // Crear conductor
        await conductor.realiza(CrearConductor(datosConductor));
        await conductor.realiza(CerrarModalExitoConductor());

        // Buscar y desactivar
        await conductor.realiza(BuscarConductorEnListado(datosConductor.numeroDocumento));
        await conductor.realiza(ToggleSliderEstado('Desactivar conductor'));

        // Validar mensaje de éxito
        const hayExito = await conductor.pregunta(CuerpoContieneTexto('desactivado'));
        expect(hayExito).toBe(true);
    });

    test('CD-04.2: Activar conductor', async ({ conductor, page }) => {
        const datosConductor = generarConductor();

        // Crear conductor
        await conductor.realiza(CrearConductor(datosConductor));
        await conductor.realiza(CerrarModalExitoConductor());

        // Buscar y desactivar primero
        await conductor.realiza(BuscarConductorEnListado(datosConductor.numeroDocumento));
        await conductor.realiza(ToggleSliderEstado('Desactivar conductor'));

        // Buscar y activar
        await conductor.realiza(BuscarConductorEnListado(datosConductor.numeroDocumento));
        await conductor.realiza(ToggleSliderEstado('Activar conductor'));

        // Validar mensaje de éxito
        const hayExito = await conductor.pregunta(CuerpoContieneTexto('activado'));
        expect(hayExito).toBe(true);
    });
});
