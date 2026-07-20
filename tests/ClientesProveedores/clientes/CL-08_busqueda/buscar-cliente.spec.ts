import {test, expect} from '@fixtures/clientes-proveedores/clientes.fixture';
import {CrearCliente} from '@screenplay/tasks/clientes-proveedores/clientes/CrearCliente';
import {BuscarClienteEnListado} from '@screenplay/tasks/clientes-proveedores/clientes/BuscarCliente';
import {
    ClienteVisibleEnListado,
    SinResultadosBusqueda,
} from '@screenplay/questions/clientes-proveedores/ClienteQuestions';
import {generarClienteDNI} from '@data/clientes-proveedores/clientes.data';

test.describe('CL-08 | Búsqueda General de Clientes', {tag: ['@clientes', '@busqueda']}, () => {

    test('SC-01: Buscar cliente por nombre @CL-08.1', async ({cliente}) => {
        const datos = generarClienteDNI();
        await cliente.realiza(CrearCliente(datos));

        // Act: Buscar por nombre/razón social
        await cliente.realiza(BuscarClienteEnListado(datos.nombreRazonSocial));

        // Assert: Aparece con documento correcto
        await cliente.realiza(ClienteVisibleEnListado(datos.numeroDocumento));
    });

    test('SC-02: Buscar cliente por número de documento @CL-08.2', async ({cliente}) => {
        const datos = generarClienteDNI();
        await cliente.realiza(CrearCliente(datos));

        // Act: Buscar por documento
        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));

        // Assert: Aparece con nombre correcto
        await cliente.realiza(ClienteVisibleEnListado(datos.nombreRazonSocial));
    });

    test('SC-03: Buscar cliente por teléfono @CL-08.3', async ({cliente}) => {
        const datos = generarClienteDNI();
        await cliente.realiza(CrearCliente(datos));

        // Act: Buscar por teléfono
        await cliente.realiza(BuscarClienteEnListado(datos.telefono));

        // Assert: Aparece con nombre correcto
        await cliente.realiza(ClienteVisibleEnListado(datos.nombreRazonSocial));
    });

    test('SC-04: Buscar cliente inexistente muestra sin resultados @CL-08.4', async ({cliente}) => {
        // Act: Buscar con criterio que no existe
        await cliente.realiza(BuscarClienteEnListado('XXXXXXXXXX-NO-EXISTE'));

        // Assert: Sin resultados
        await cliente.realiza(SinResultadosBusqueda());
    });
});
