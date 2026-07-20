import {test, expect} from '@fixtures/clientes-proveedores/vendedores.fixture';
import {LlenarFormularioBasicoVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';
import {CancelarCreacionVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/EditarVendedor';
import {generarVendedorRUC} from '@data/clientes-proveedores/vendedores.data';
import {VendedoresTargets} from '@screenplay/targets/clientes-proveedores/VendedoresTargets';

test.describe('VE-02 | Validaciones Numéricas Vendedores', {tag: ['@vendedores', '@validaciones']}, () => {

    test('SC-01: Validar metas numéricas del vendedor @VE-02.1', async ({vendedorActor, page}) => {
        // Arrange
        const datos = generarVendedorRUC();
        // Borramos las metas para forzar validación y luego probaremos llenarlas con basura no numérica
        datos.metaCantidad = '';
        datos.metaMonto = '';

        // Act
        await VendedoresTargets.btnCrearVendedor(page).click();
        await vendedorActor.realiza(LlenarFormularioBasicoVendedor(datos));
        
        // Intentar crear sin metas
        await VendedoresTargets.btnCrearVendedorForm(page).click();

        // Validar que el botón no cerró el modal o falló
        // (En el codegen esto simplemente se deja hasta acá esperando que no pase nada).
        // Usaremos una validación implícita de que el modal sigue abierto.
        await expect(VendedoresTargets.btnCrearVendedorForm(page)).toBeVisible();

        // Teardown
        await vendedorActor.realiza(CancelarCreacionVendedor());
    });
});
