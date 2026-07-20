import {test, expect} from '@fixtures/clientes-proveedores/clientes.fixture';
import {
    AbrirMenuDescargas,
    DescargarClientesFiltrados,
    DescargarTodosLosClientes,
} from '@screenplay/tasks/clientes-proveedores/clientes/DescargaCliente';
import {BuscarClienteEnListado} from '@screenplay/tasks/clientes-proveedores/clientes/BuscarCliente';
import {CrearCliente} from '@screenplay/tasks/clientes-proveedores/clientes/CrearCliente';
import {EliminarCliente} from '@screenplay/tasks/clientes-proveedores/clientes/EliminarCliente';
import {generarClienteDNI} from '@data/clientes-proveedores/clientes.data';
import {ClientesTargets} from '@screenplay/targets/clientes-proveedores/ClientesTargets';

test.describe('CL-10 | Exportación de Clientes', {tag: ['@clientes', '@exportacion']}, () => {

    test('SC-01: Descargar clientes filtrados @CL-10.1', async ({cliente, page}) => {
        
        const datos = generarClienteDNI();
        await cliente.realiza(CrearCliente(datos));
        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));

        
        await cliente.realiza(AbrirMenuDescargas());
        await cliente.realiza(DescargarClientesFiltrados());

        
        

        
        await cliente.realiza(EliminarCliente(datos.numeroDocumento));
    });

    test('SC-02: Descargar todos los clientes @CL-10.2', async ({cliente, page}) => {
        
        await ClientesTargets.btnBorrarFiltros(page).click().catch(() => {});

        
        await cliente.realiza(AbrirMenuDescargas());
        await cliente.realiza(DescargarTodosLosClientes());

        
    });
});
