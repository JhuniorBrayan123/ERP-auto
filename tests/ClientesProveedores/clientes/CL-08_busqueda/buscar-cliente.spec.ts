import {test} from '@fixtures/clientes-proveedores/clientes.fixture';
import {CrearCliente} from '@screenplay/tasks/clientes-proveedores/clientes/CrearCliente';
import {BuscarClienteConFiltroAvanzado} from '@screenplay/tasks/clientes-proveedores/clientes/BuscarCliente';
import {EliminarCliente} from '@screenplay/tasks/clientes-proveedores/clientes/EliminarCliente';
import {
    ClienteVisibleEnListado,
    SinResultadosBusqueda,
} from '@screenplay/questions/clientes-proveedores/ClienteQuestions';
import {generarClienteDNI} from '@data/clientes-proveedores/clientes.data';
import {ClientesTargets} from "@screenplay/targets/clientes-proveedores/ClientesTargets";

test.describe('CL-08 | Búsqueda General de Clientes', {tag: ['@clientes', '@busqueda']}, () => {

    test('SC-01: Buscar cliente por nombre @CL-08.1', async ({cliente, page}) => {
        const datos = generarClienteDNI();
        await cliente.realiza(CrearCliente(datos));
        await cliente.realiza(BuscarClienteConFiltroAvanzado('nombre', datos.nombreRazonSocial));
        await cliente.realiza(ClienteVisibleEnListado(datos.numeroDocumento));
        await ClientesTargets.btnVerFiltros(page).click();
        await cliente.realiza(EliminarCliente(datos.numeroDocumento));
    });

    test('SC-02: Buscar cliente por número de documento @CL-08.2', async ({cliente, page}) => {
        const datos = generarClienteDNI();
        await cliente.realiza(CrearCliente(datos));
        await cliente.realiza(BuscarClienteConFiltroAvanzado('documento', datos.numeroDocumento));
        await cliente.realiza(ClienteVisibleEnListado(datos.nombreRazonSocial));
        await ClientesTargets.btnVerFiltros(page).click();
        await cliente.realiza(EliminarCliente(datos.numeroDocumento));
    });

    test('SC-03: Buscar cliente por teléfono @CL-08.3', async ({cliente, page}) => {
        const datos = generarClienteDNI();
        await cliente.realiza(CrearCliente(datos));
        await cliente.realiza(BuscarClienteConFiltroAvanzado('telefono', datos.telefono));
        await cliente.realiza(ClienteVisibleEnListado(datos.nombreRazonSocial));
        await ClientesTargets.btnVerFiltros(page).click();
        await cliente.realiza(EliminarCliente(datos.numeroDocumento));
    });

    test('SC-04: Buscar cliente inexistente muestra sin resultados @CL-08.4', async ({cliente}) => {

        await cliente.realiza(BuscarClienteConFiltroAvanzado('nombre', 'XXXXXXXXXX-NO-EXISTE'));
        await cliente.realiza(SinResultadosBusqueda());
    });
});
