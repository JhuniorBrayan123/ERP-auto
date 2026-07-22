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
    ClickGuardarCambiosConductor,
} from '@screenplay/tasks/clientes-proveedores/conductores/EditarConductor';
import { generarConductorDNI } from '@data/clientes-proveedores/conductores.data';
import { EliminarConductor } from '@screenplay/tasks/clientes-proveedores/conductores/EliminarConductor';
import { CuerpoContieneTexto } from '@screenplay/questions/clientes-proveedores/ClienteQuestions';

test.describe('CD-03 | Edición de Conductor', { tag: ['@conductores', '@edicion', '@CD-03'] }, () => {

    test('CD-03.1: Editar nombre de conductor y validar', async ({ conductorActor, page }) => {
        const datosConductor = generarConductorDNI();
        const nombreEditado = `${datosConductor.nombreRazonSocial} EDITADO`;

        
        await conductorActor.realiza(CrearConductor(datosConductor));
        
        await conductorActor.realiza(BuscarConductorEnListado(datosConductor.numeroDocumento));
        await conductorActor.realiza(AbrirAccionContextualConductor('Editar conductor'));

        
        await conductorActor.realiza(EditarNombreConductor(nombreEditado));
        await conductorActor.realiza(ClickGuardarCambiosConductor());
        await conductorActor.realiza(CerrarModalExitoConductor());

        await conductorActor.realiza(BuscarConductorEnListado(nombreEditado));
        const visible = await conductorActor.pregunta(ValidarConductorVisible(nombreEditado));
        expect(visible).toBe(true);

        await conductorActor.realiza(EliminarConductor(datosConductor.numeroDocumento));
    });
});
