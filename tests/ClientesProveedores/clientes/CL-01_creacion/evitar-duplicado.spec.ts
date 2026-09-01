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
import {ClickCancelar, ClickSiCancelar, EliminarCliente} from '@screenplay/tasks/clientes-proveedores/clientes/EliminarCliente';
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

        
        await cliente.realiza(CrearCliente(datos));
        await cliente.realiza(AbrirCrearCliente());
        await cliente.realiza(SeleccionarTipoDocCliente(datos.tipoDocumento));
        await cliente.realiza(LlenarNumeroDocumentoCliente(datos.numeroDocumento));
        await cliente.realiza(LlenarNombreRazonSocialCliente(`${datos.nombreRazonSocial}-dup`));
        await cliente.realiza(LlenarDireccionCliente(datos.direccion));
        await cliente.realiza(LlenarTelefonoCliente(datos.telefono));
        await cliente.realiza(LlenarEmailCliente(datos.email));
        await cliente.realiza(ClickCrearCliente());

        await cliente.realiza(MensajeDuplicadoVisible());

        
        await cliente.realiza(ClickCancelar());
        await cliente.realiza(ClickSiCancelar());

        
        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(ClienteVisibleEnListado(datos.nombreRazonSocial));

        
        await cliente.realiza(EliminarCliente(datos.numeroDocumento));
    });
});
