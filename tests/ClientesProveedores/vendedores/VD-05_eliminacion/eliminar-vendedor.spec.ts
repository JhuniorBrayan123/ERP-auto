import {test, expect} from '@fixtures/clientes-proveedores/vendedores.fixture';
import {CrearVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';
import {BuscarVendedorEnListado} from '@screenplay/tasks/clientes-proveedores/vendedores/BuscarVendedor';
import {ClickEliminarConfirmarVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/EliminarVendedor';
import {generarVendedorDNI} from '@data/clientes-proveedores/vendedores.data';
import {VendedoresTargets} from '@screenplay/targets/clientes-proveedores/VendedoresTargets';

test.describe('VD-05 | Eliminación de Vendedores', {tag: ['@vendedores', '@eliminacion']}, () => {

    test('SC-01: Eliminar vendedor @VD-05.1', async ({vendedor, page}) => {
        const datos = generarVendedorDNI();
        await vendedor.realiza(CrearVendedor(datos));

        await vendedor.realiza(BuscarVendedorEnListado(datos.numeroDocumento));
        await VendedoresTargets.botonContextual(page).click();
        await page.getByText('Eliminar vendedor').click();
        await vendedor.realiza(ClickEliminarConfirmarVendedor());

        await expect(page.locator('body')).toContainText('El vendedor fue eliminado exitosamente');
        await VendedoresTargets.btnCerrarModal(page).click();
        await VendedoresTargets.btnBorrarFiltros(page).click();
        await vendedor.realiza(BuscarVendedorEnListado(datos.numeroDocumento));
        await expect(page.getByRole('cell')).toContainText('NO HAY RESULTADOS');
    });
});
