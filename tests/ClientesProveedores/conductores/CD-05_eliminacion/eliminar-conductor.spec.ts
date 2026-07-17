import {test, expect} from '@fixtures/clientes-proveedores/conductores.fixture';
import {CrearConductor} from '@screenplay/tasks/clientes-proveedores/conductores/CrearConductor';
import {BuscarConductorEnListado} from '@screenplay/tasks/clientes-proveedores/conductores/BuscarConductor';
import {ClickEliminarConfirmarConductor} from '@screenplay/tasks/clientes-proveedores/conductores/EliminarConductor';
import {generarConductor} from '@data/clientes-proveedores/conductores.data';
import {ConductoresTargets} from '@screenplay/targets/clientes-proveedores/ConductoresTargets';

test.describe('CD-05 | Eliminación de Conductores', {tag: ['@conductores', '@eliminacion']}, () => {

    test('SC-01: Eliminar conductor @CD-05.1', async ({conductor, page}) => {
        const datos = generarConductor();
        await conductor.realiza(CrearConductor(datos));

        await conductor.realiza(BuscarConductorEnListado(datos.numeroDocumento));
        await ConductoresTargets.botonContextual(page).click();
        await page.getByText('Eliminar conductor').click();
        await conductor.realiza(ClickEliminarConfirmarConductor());

        await expect(page.locator('body')).toContainText('El conductor fue eliminado exitosamente');
        await ConductoresTargets.btnCerrarModal(page).click();
        await ConductoresTargets.btnBorrarFiltros(page).click();
        await conductor.realiza(BuscarConductorEnListado(datos.numeroDocumento));
        await expect(page.getByRole('cell')).toContainText('NO HAY RESULTADOS');
    });
});
