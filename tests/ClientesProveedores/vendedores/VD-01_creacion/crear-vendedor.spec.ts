import {test, expect} from '@fixtures/clientes-proveedores/vendedores.fixture';
import {CrearVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';
import {generarVendedorDNI, generarVendedorRUC} from '@data/clientes-proveedores/vendedores.data';

test.describe('VD-01 | Creación de Vendedores', {tag: ['@vendedores', '@creacion']}, () => {

    test('SC-01: Crear vendedor DNI @VD-01.1', async ({vendedor}) => {
        const datos = generarVendedorDNI();
        await vendedor.realiza(CrearVendedor(datos));
    });

    test('SC-02: Crear vendedor RUC @VD-01.2', async ({vendedor}) => {
        const datos = generarVendedorRUC();
        await vendedor.realiza(CrearVendedor(datos));
    });
});
