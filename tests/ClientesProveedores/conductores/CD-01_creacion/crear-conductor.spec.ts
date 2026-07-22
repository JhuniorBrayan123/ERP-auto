import { test, expect } from '@fixtures/clientes-proveedores/conductores.fixture';
import {
    CrearConductor,
} from '@screenplay/tasks/clientes-proveedores/conductores/CrearConductor';
import { BuscarConductorEnListado, ValidarConductorVisible } from '@screenplay/tasks/clientes-proveedores/conductores/BuscarConductor';
import { EliminarConductor } from '@screenplay/tasks/clientes-proveedores/conductores/EliminarConductor';
import { generarConductorDNI, generarConductorConCodigoManual } from '@data/clientes-proveedores/conductores.data';

test.describe('CD-01 | Creación de Conductores', { tag: ['@conductores', '@creacion', '@CD-01'] }, () => {

    test('CD-01.1: Crear conductor con DNI (datos básicos)', async ({ conductorActor, page }) => {
        const datosConductor = generarConductorDNI();

        await conductorActor.realiza(CrearConductor(datosConductor));
        await conductorActor.realiza(BuscarConductorEnListado(datosConductor.numeroDocumento));
        const visible = await conductorActor.pregunta(ValidarConductorVisible(datosConductor.nombreRazonSocial));
        expect(visible).toBe(true);

        await conductorActor.realiza(EliminarConductor(datosConductor.numeroDocumento));
    });
    test('CD-01.2: Crear conductor con código manual', async ({ conductorActor, page }) => {
        const datosConductor = generarConductorConCodigoManual();

        await conductorActor.realiza(CrearConductor(datosConductor));

        await conductorActor.realiza(BuscarConductorEnListado(datosConductor.numeroDocumento));
        const visible = await conductorActor.pregunta(ValidarConductorVisible(datosConductor.nombreRazonSocial));
        expect(visible).toBe(true);

        await conductorActor.realiza(EliminarConductor(datosConductor.numeroDocumento));
    });
});
