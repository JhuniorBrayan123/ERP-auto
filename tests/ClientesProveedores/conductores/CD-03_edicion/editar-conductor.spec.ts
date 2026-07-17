import {test, expect} from '@fixtures/clientes-proveedores/conductores.fixture';
import {CrearConductor} from '@screenplay/tasks/clientes-proveedores/conductores/CrearConductor';
import {BuscarConductorEnListado} from '@screenplay/tasks/clientes-proveedores/conductores/BuscarConductor';
import {ClickGuardarCambiosConductor, EditarNombreConductor} from '@screenplay/tasks/clientes-proveedores/conductores/EditarConductor';
import {generarConductor} from '@data/clientes-proveedores/conductores.data';
import {ConductoresTargets} from '@screenplay/targets/clientes-proveedores/ConductoresTargets';

test.describe('CD-03 | Edición de Conductores', {tag: ['@conductores', '@edicion']}, () => {

    test('SC-01: Editar nombre y verificar @CD-03.1', async ({conductor, page}) => {
        const datos = generarConductor();
        await conductor.realiza(CrearConductor(datos));

        await conductor.realiza(BuscarConductorEnListado(datos.numeroDocumento));
        await ConductoresTargets.botonContextual(page).click();
        await page.getByText('Editar conductor').click();

        const nombreEditado = `${datos.nombreRazonSocial}-editado`;
        await conductor.realiza(EditarNombreConductor(nombreEditado));
        await conductor.realiza(ClickGuardarCambiosConductor());

        await expect(page.locator('body')).toContainText('Los cambios se guardaron exitosamente');
        await ConductoresTargets.btnCerrarModal(page).click();
        await conductor.realiza(BuscarConductorEnListado(datos.numeroDocumento));
        await expect(ConductoresTargets.tbody(page)).toContainText(nombreEditado);
    });
});
