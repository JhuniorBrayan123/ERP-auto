import {test} from '@fixtures/clientes-proveedores/conductores.fixture';
import {CrearConductor} from '@screenplay/tasks/clientes-proveedores/conductores/CrearConductor';
import {CambiarEstadoConductor} from '@screenplay/tasks/clientes-proveedores/conductores/CambiarEstadoConductor';
import {EliminarConductor} from '@screenplay/tasks/clientes-proveedores/conductores/EliminarConductor';
import {generarConductorDNI} from '@data/clientes-proveedores/conductores.data';
import {NavegarAListadoConductores} from '@screenplay/tasks/cross-modules/NavegarAListadoConductores';
import {
    VerificarConductorNoEncontradoEnGuia
} from '@screenplay/tasks/cross-modules/VerificarConductorNoEncontradoEnGuia';
import {VerificarConductorEncontradoEnGuia} from '@screenplay/tasks/cross-modules/VerificarConductorEncontradoEnGuia';

test.describe('IN-03 | Integración Conductor - Guías', {tag: ['@integracion', '@guias', '@conductores']}, () => {

    test('SC-01: Comportamiento de conductor inactivo y activo en guías @IN-03.1', async ({conductorActor}) => {
        const datos = generarConductorDNI();

        await conductorActor.realiza(CrearConductor(datos));
        await conductorActor.realiza(CambiarEstadoConductor(datos.numeroDocumento, 'Desactivar conductor'));
        await conductorActor.realiza(VerificarConductorNoEncontradoEnGuia(datos.numeroDocumento));
        await conductorActor.realiza(NavegarAListadoConductores());
        await conductorActor.realiza(CambiarEstadoConductor(datos.numeroDocumento, 'Activar conductor'));
        await conductorActor.realiza(VerificarConductorEncontradoEnGuia(datos.numeroDocumento));
        await conductorActor.realiza(NavegarAListadoConductores());
        await conductorActor.realiza(EliminarConductor(datos.numeroDocumento));
    });
});