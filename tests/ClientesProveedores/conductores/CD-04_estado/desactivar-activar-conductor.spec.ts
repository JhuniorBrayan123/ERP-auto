import {test, expect} from '@fixtures/clientes-proveedores/conductores.fixture';
import {CrearConductor} from '@screenplay/tasks/clientes-proveedores/conductores/CrearConductor';
import {BuscarConductorEnListado} from '@screenplay/tasks/clientes-proveedores/conductores/BuscarConductor';
import {DesactivarConductor, ToggleSliderEstadoConductor} from '@screenplay/tasks/clientes-proveedores/conductores/ToggleEstadoConductor';
import {generarConductor} from '@data/clientes-proveedores/conductores.data';
import {ConductoresTargets} from '@screenplay/targets/clientes-proveedores/ConductoresTargets';

test.describe('CD-04 | Desactivar/Activar Conductor', {tag: ['@conductores', '@estado']}, () => {

    test('SC-01: Desactivar conductor @CD-04.1', async ({conductor, page}) => {
        const datos = generarConductor();
        await conductor.realiza(CrearConductor(datos));
        await conductor.realiza(BuscarConductorEnListado(datos.numeroDocumento));
        await conductor.realiza(DesactivarConductor());
        await expect(page.locator('tbody')).toContainText('INACTIVO');
    });

    test('SC-02: Activar conductor @CD-04.2', async ({conductor, page}) => {
        const datos = Object.assign(generarConductor(), {estado: 'Inactivo' as const});
        await conductor.realiza(CrearConductor(datos));
        await conductor.realiza(BuscarConductorEnListado(datos.numeroDocumento));
        await conductor.realiza(ToggleSliderEstadoConductor());
        await ConductoresTargets.btnBorrarFiltros(page).click();
        await conductor.realiza(BuscarConductorEnListado(datos.numeroDocumento));
        await expect(page.locator('tbody')).toContainText('ACTIVO');
    });
});
