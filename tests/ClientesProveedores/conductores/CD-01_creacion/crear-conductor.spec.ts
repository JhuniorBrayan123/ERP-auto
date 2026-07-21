import { test, expect } from '@fixtures/clientes-proveedores/conductores.fixture';
import {
    CrearConductor,
    CerrarModalExitoConductor,
} from '@screenplay/tasks/clientes-proveedores/conductores/CrearConductor';
import { BuscarConductorEnListado, ValidarConductorVisible } from '@screenplay/tasks/clientes-proveedores/conductores/BuscarConductor';
import { generarConductor, generarConductorConCodigoManual } from '@data/clientes-proveedores/conductores.data';

test.describe('CD-01 | Creación de Conductores', { tag: ['@conductores', '@creacion', '@CD-01'] }, () => {

    test('CD-01.1: Crear conductor con DNI (datos básicos)', async ({ conductor, page }) => {
        const datosConductor = generarConductor();

        await conductor.realiza(CrearConductor(datosConductor));

        // Validar modal de éxito
        const modalVisible = await page.locator('[id*="modal-exito"]').isVisible();
        expect(modalVisible).toBe(true);

        await conductor.realiza(CerrarModalExitoConductor());

        // Buscar y validar en listado
        await conductor.realiza(BuscarConductorEnListado(datosConductor.numeroDocumento));
        const visible = await conductor.pregunta(ValidarConductorVisible(datosConductor.nombreRazonSocial));
        expect(visible).toBe(true);
    });

    test('CD-01.2: Crear conductor con código manual', async ({ conductor, page }) => {
        const datosConductor = generarConductorConCodigoManual();

        await conductor.realiza(CrearConductor(datosConductor));

        // Validar modal de éxito
        const modalVisible = await page.locator('[id*="modal-exito"]').isVisible();
        expect(modalVisible).toBe(true);

        await conductor.realiza(CerrarModalExitoConductor());

        // Buscar y validar en listado
        await conductor.realiza(BuscarConductorEnListado(datosConductor.numeroDocumento));
        const visible = await conductor.pregunta(ValidarConductorVisible(datosConductor.nombreRazonSocial));
        expect(visible).toBe(true);
    });
});
