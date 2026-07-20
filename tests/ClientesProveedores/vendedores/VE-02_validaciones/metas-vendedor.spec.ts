import {expect, test} from '@fixtures/clientes-proveedores/vendedores.fixture';
import {LlenarFormularioBasicoVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';
import {generarVendedorRUC} from '@data/clientes-proveedores/vendedores.data';
import {VendedoresTargets} from '@screenplay/targets/clientes-proveedores/VendedoresTargets';

test.describe('VE-02 | Validaciones Numéricas Vendedores', {tag: ['@vendedores', '@validaciones']}, () => {

    test('SC-01: Validar metas numéricas del vendedor @VE-02.1', async ({vendedorActor, page}) => {

        const datos = generarVendedorRUC();

        datos.metaCantidad = '';
        datos.metaMonto = '';

        await VendedoresTargets.btnCrearVendedor(page).click();
        await vendedorActor.realiza(LlenarFormularioBasicoVendedor(datos));
        await VendedoresTargets.btnCrearVendedorForm(page).click();
        await expect(VendedoresTargets.btnCrearVendedorForm(page)).toBeVisible();
    });
});
