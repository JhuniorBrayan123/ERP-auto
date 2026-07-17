import {test, expect} from '@fixtures/clientes-proveedores/vendedores.fixture';
import {CrearVendedor, AbrirCrearVendedor, SeleccionarTipoDocVendedor, LlenarNumeroDocumentoVendedor, LlenarNombreRazonSocialVendedor, LlenarDireccionVendedor, LlenarTelefonoVendedor, LlenarEmailVendedor, ClickCrearVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';
import {generarVendedorDNI} from '@data/clientes-proveedores/vendedores.data';

test.describe('VD-01b | Evitar Vendedor Duplicado', {tag: ['@vendedores', '@duplicado']}, () => {

    test('SC-01: No permitir crear vendedor con mismo documento @VD-01.3', async ({vendedor, page}) => {
        const datos = generarVendedorDNI();
        await vendedor.realiza(CrearVendedor(datos));

        await vendedor.realiza(AbrirCrearVendedor());
        await vendedor.realiza(SeleccionarTipoDocVendedor(datos.tipoDocumento));
        await vendedor.realiza(LlenarNumeroDocumentoVendedor(datos.numeroDocumento));
        await vendedor.realiza(LlenarNombreRazonSocialVendedor(`${datos.nombreRazonSocial}-dup`));
        await vendedor.realiza(LlenarDireccionVendedor(datos.direccion));
        await vendedor.realiza(LlenarTelefonoVendedor(datos.telefono));
        await vendedor.realiza(LlenarEmailVendedor(datos.email));
        await vendedor.realiza(ClickCrearVendedor());

        await expect(page.locator('body')).toContainText(/ya esta registrado/);
    });
});
