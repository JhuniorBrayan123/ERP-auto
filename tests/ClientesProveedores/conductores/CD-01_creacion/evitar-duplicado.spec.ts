import { test, expect } from '@fixtures/clientes-proveedores/conductores.fixture';
import {
    CrearConductor,
    CerrarModalExitoConductor,
} from '@screenplay/tasks/clientes-proveedores/conductores/CrearConductor';
import { BuscarConductorEnListado, ValidarConductorVisible } from '@screenplay/tasks/clientes-proveedores/conductores/BuscarConductor';
import { generarConductor } from '@data/clientes-proveedores/conductores.data';
import { CuerpoContieneTexto } from '@screenplay/questions/clientes-proveedores/ClienteQuestions';

test.describe('CD-01 | Evitar duplicado de Conductor', { tag: ['@conductores', '@creacion', '@duplicado'] }, () => {

    test('CD-01.3: Intentar crear conductor duplicado muestra error', async ({ conductor, page }) => {
        const datosConductor = generarConductor();

        // Crear el conductor la primera vez
        await conductor.realiza(CrearConductor(datosConductor));
        await conductor.realiza(CerrarModalExitoConductor());

        // Verificar que se creó correctamente
        await conductor.realiza(BuscarConductorEnListado(datosConductor.numeroDocumento));
        const visible = await conductor.pregunta(ValidarConductorVisible(datosConductor.nombreRazonSocial));
        expect(visible).toBe(true);

        // Intentar crear el mismo conductor otra vez
        await conductor.realiza(CrearConductor(datosConductor));

        // Validar que aparece mensaje de error por duplicado
        const hayErrorYaExiste = await conductor.pregunta(CuerpoContieneTexto('ya existe'));
        const hayErrorDuplicado = await conductor.pregunta(CuerpoContieneTexto('duplicado'));
        expect(hayErrorYaExiste || hayErrorDuplicado).toBe(true);
    });
});
