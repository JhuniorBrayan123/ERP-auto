import {test, expect} from '@fixtures/clientes-proveedores/vendedores.fixture';
import {CrearVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';
import {BuscarVendedorEnListado} from '@screenplay/tasks/clientes-proveedores/vendedores/BuscarVendedor';
import {DesactivarVendedor, ToggleSliderEstadoVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/ToggleEstadoVendedor';
import {generarVendedorDNI} from '@data/clientes-proveedores/vendedores.data';
import {VendedoresTargets} from '@screenplay/targets/clientes-proveedores/VendedoresTargets';

test.describe('VD-04 | Desactivar/Activar Vendedor', {tag: ['@vendedores', '@estado']}, () => {

    test('SC-01: Desactivar vendedor @VD-04.1', async ({vendedor, page}) => {
        const datos = generarVendedorDNI();
        await vendedor.realiza(CrearVendedor(datos));
        await vendedor.realiza(BuscarVendedorEnListado(datos.numeroDocumento));
        await vendedor.realiza(DesactivarVendedor());
        await expect(page.locator('tbody')).toContainText('INACTIVO');
    });

    test('SC-02: Activar vendedor @VD-04.2', async ({vendedor, page}) => {
        const datos = Object.assign(generarVendedorDNI(), {estado: 'Inactivo' as const});
        await vendedor.realiza(CrearVendedor(datos));
        await vendedor.realiza(BuscarVendedorEnListado(datos.numeroDocumento));
        await vendedor.realiza(ToggleSliderEstadoVendedor());
        await VendedoresTargets.btnBorrarFiltros(page).click();
        await vendedor.realiza(BuscarVendedorEnListado(datos.numeroDocumento));
        await expect(page.locator('tbody')).toContainText('ACTIVO');
    });
});
