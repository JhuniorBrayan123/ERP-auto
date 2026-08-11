import {test, expect} from '@fixtures/clientes-proveedores/clientes.fixture';
import {CrearCliente} from '@screenplay/tasks/clientes-proveedores/clientes/CrearCliente';
import {BuscarClienteEnListado} from '@screenplay/tasks/clientes-proveedores/clientes/BuscarCliente';
import {EliminarCliente} from '@screenplay/tasks/clientes-proveedores/clientes/EliminarCliente';
import {
    AbrirNotasAdicionales,
    AbrirDetalleCliente,
    AgregarNotaDesdePanel,
    CerrarDrape,
    ClickAtras,
} from '@screenplay/tasks/clientes-proveedores/clientes/NotaAdicionalCliente';
import {
    NotaVisibleEnPanel,
    NotaVisibleEnDetalle,
} from '@screenplay/questions/clientes-proveedores/ClienteQuestions';
import {generarClienteDNI, generarNota} from '@data/clientes-proveedores/clientes.data';

test.describe('CL-06 | Notas Adicionales de Cliente', {tag: ['@clientes', '@notas']}, () => {

    test('SC-01: Crear nota y validar en panel y detalle @CL-06.1', async ({cliente}) => {
        
        const datos = generarClienteDNI();
        const nota = generarNota();
        await cliente.realiza(CrearCliente(datos));

        
        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(AbrirNotasAdicionales());
        await cliente.realiza(AgregarNotaDesdePanel(nota.titulo, nota.mensaje));

        
        await cliente.realiza(NotaVisibleEnPanel(nota.titulo));
        await cliente.realiza(NotaVisibleEnPanel(nota.mensaje));
        await cliente.realiza(CerrarDrape());

        
        await cliente.realiza(AbrirDetalleCliente());
        await cliente.realiza(NotaVisibleEnDetalle(nota.mensaje));
        await cliente.realiza(ClickAtras());

        
        await cliente.realiza(EliminarCliente(datos.numeroDocumento));
    });
});
