import {test, expect} from '@fixtures/clientes-proveedores/vendedores.fixture';
import {CrearVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';
import {BuscarVendedorEnListado} from '@screenplay/tasks/clientes-proveedores/vendedores/BuscarVendedor';
import {ClickGuardarCambiosVendedor, EditarNombreVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/EditarVendedor';
import {generarVendedorDNI} from '@data/clientes-proveedores/vendedores.data';
import {VendedoresTargets} from '@screenplay/targets/clientes-proveedores/VendedoresTargets';

test.describe('VD-03 | Edición de Vendedores', {tag: ['@vendedores', '@edicion']}, () => {

    test('SC-01: Editar nombre y verificar @VD-03.1', async ({vendedor, page}) => {
        const datos = generarVendedorDNI();
        await vendedor.realiza(CrearVendedor(datos));

        await vendedor.realiza(BuscarVendedorEnListado(datos.numeroDocumento));
        await VendedoresTargets.botonContextual(page).click();
        await page.getByText('Editar vendedor').click();

        const nombreEditado = `${datos.nombreRazonSocial}-editado`;
        await vendedor.realiza(EditarNombreVendedor(nombreEditado));
        await vendedor.realiza(ClickGuardarCambiosVendedor());

        await expect(page.locator('body')).toContainText('Los cambios se guardaron exitosamente');
        await VendedoresTargets.btnCerrarModal(page).click();
        await vendedor.realiza(BuscarVendedorEnListado(datos.numeroDocumento));
        await expect(VendedoresTargets.tbody(page)).toContainText(nombreEditado);
    });
});
