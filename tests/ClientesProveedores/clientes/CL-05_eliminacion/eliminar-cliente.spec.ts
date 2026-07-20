import {test, expect} from '@fixtures/clientes-proveedores/clientes.fixture';
import {CrearCliente} from '@screenplay/tasks/clientes-proveedores/clientes/CrearCliente';
import {BuscarClienteEnListado, AbrirAccionContextualCliente} from '@screenplay/tasks/clientes-proveedores/clientes/BuscarCliente';
import {ClickEliminarConfirmar} from '@screenplay/tasks/clientes-proveedores/clientes/EliminarCliente';
import {AbrirBitacora, CerrarDrape} from '@screenplay/tasks/clientes-proveedores/clientes/NotaAdicionalCliente';
import {
    MensajeEliminacionVisible,
    BitacoraContieneAccion,
    SinResultadosBusqueda,
} from '@screenplay/questions/clientes-proveedores/ClienteQuestions';
import {generarClienteRUC} from '@data/clientes-proveedores/clientes.data';
import {ClientesTargets} from '@screenplay/targets/clientes-proveedores/ClientesTargets';

test.describe('CL-05 | Eliminación de Clientes', {tag: ['@clientes', '@eliminacion']}, () => {

    test('SC-01: Eliminar cliente sin ventas, validar éxito y desaparición @CL-05.1', async ({cliente, page}) => {
        
        const datos = generarClienteRUC();
        await cliente.realiza(CrearCliente(datos));

        
        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(AbrirBitacora());
        await cliente.realiza(BitacoraContieneAccion('Creación de cliente'));
        await cliente.realiza(CerrarDrape());

        
        await cliente.realiza(AbrirAccionContextualCliente('Eliminar cliente'));
        await cliente.realiza(ClickEliminarConfirmar());

        
        await cliente.realiza(MensajeEliminacionVisible());
        await ClientesTargets.btnCerrarModal(page).click();

        
        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(SinResultadosBusqueda());
    });
});
