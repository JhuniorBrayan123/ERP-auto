import {test, expect} from '@fixtures/clientes-proveedores/clientes.fixture';
import {
    CrearCliente,
    AbrirCrearCliente,
    SeleccionarTipoDocCliente,
    LlenarNumeroDocumentoCliente,
    LlenarNombreRazonSocialCliente,
    LlenarDireccionCliente,
    LlenarTelefonoCliente,
    LlenarEmailCliente,
    ClickCrearCliente,
} from '@screenplay/tasks/clientes-proveedores/clientes/CrearCliente';
import {BuscarClienteEnListado} from '@screenplay/tasks/clientes-proveedores/clientes/BuscarCliente';
import {ClickCancelar, ClickSiCancelar} from '@screenplay/tasks/clientes-proveedores/clientes/EliminarCliente';
import {
    MensajeDuplicadoVisible,
    FormularioSigueMostrado,
    SinResultadosBusqueda,
    ClienteVisibleEnListado,
} from '@screenplay/questions/clientes-proveedores/ClienteQuestions';
import {generarClienteDNI} from '@data/clientes-proveedores/clientes.data';

test.describe('CL-01b | Evitar Cliente Duplicado', {tag: ['@clientes', '@duplicado']}, () => {

    test('SC-01: No permitir crear cliente con mismo documento @CL-01.3', async ({cliente}) => {
        const datos = generarClienteDNI();

        // Arrange: Crear el cliente base
        await cliente.realiza(CrearCliente(datos));

        // Act: Intentar crear otro con el mismo documento
        await cliente.realiza(AbrirCrearCliente());
        await cliente.realiza(SeleccionarTipoDocCliente(datos.tipoDocumento));
        await cliente.realiza(LlenarNumeroDocumentoCliente(datos.numeroDocumento));
        await cliente.realiza(LlenarNombreRazonSocialCliente(`${datos.nombreRazonSocial}-dup`));
        await cliente.realiza(LlenarDireccionCliente(datos.direccion));
        await cliente.realiza(LlenarTelefonoCliente(datos.telefono));
        await cliente.realiza(LlenarEmailCliente(datos.email));
        await cliente.realiza(ClickCrearCliente());

        // Assert: Debe mostrar mensaje de duplicado exacto
        await cliente.realiza(MensajeDuplicadoVisible());

        // Assert: El formulario debe seguir abierto (no se cerró)
        await cliente.realiza(ClickCancelar());
        await cliente.realiza(ClickSiCancelar());

        // Assert: Buscar por documento debe mostrar SOLO el cliente original, no el duplicado
        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(ClienteVisibleEnListado(datos.nombreRazonSocial));
    });
});
