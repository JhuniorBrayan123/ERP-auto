import { test, expect } from '@fixtures/clientes-proveedores/conductores.fixture';
import {
    CrearConductor,
    CerrarModalExitoConductor,
} from '@screenplay/tasks/clientes-proveedores/conductores/CrearConductor';
import {
    BuscarConductorEnListado,
    ValidarConductorVisible,
    AbrirAccionContextualConductor,
} from '@screenplay/tasks/clientes-proveedores/conductores/BuscarConductor';
import {
    EditarNombreConductor,
    ClickGuardarCambios,
} from '@screenplay/tasks/clientes-proveedores/conductores/EditarConductor';
import { generarConductor } from '@data/clientes-proveedores/conductores.data';
import { CuerpoContieneTexto } from '@screenplay/questions/clientes-proveedores/ClienteQuestions';

test.describe('CD-03 | Edición de Conductor', { tag: ['@conductores', '@edicion', '@CD-03'] }, () => {

    test('CD-03.1: Editar nombre de conductor y validar', async ({ conductor, page }) => {
        const datosConductor = generarConductor();
        const nombreEditado = `${datosConductor.nombreRazonSocial} EDITADO`;

        // Crear conductor
        await conductor.realiza(CrearConductor(datosConductor));
        await conductor.realiza(CerrarModalExitoConductor());

        // Buscar y abrir edición
        await conductor.realiza(BuscarConductorEnListado(datosConductor.numeroDocumento));
        await conductor.realiza(AbrirAccionContextualConductor('Editar'));

        // Editar nombre
        await conductor.realiza(EditarNombreConductor(nombreEditado));
        await conductor.realiza(ClickGuardarCambios());

        // Validar que se guardó correctamente
        const hayExito = await conductor.pregunta(CuerpoContieneTexto('actualizado'));
        expect(hayExito).toBe(true);

        // Buscar por nombre editado
        await conductor.realiza(BuscarConductorEnListado(nombreEditado));
        const visible = await conductor.pregunta(ValidarConductorVisible(nombreEditado));
        expect(visible).toBe(true);
    });
});
