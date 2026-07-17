import {test, expect} from '@fixtures/clientes-proveedores/clientes.fixture';
import {CrearCliente} from '@screenplay/tasks/clientes-proveedores/clientes/CrearCliente';
import {BuscarClienteEnListado, AbrirAccionContextualCliente, ValidarClienteVisibleEnListado} from '@screenplay/tasks/clientes-proveedores/clientes/BuscarCliente';
import {ClickEliminarConfirmar, ClickAceptarError} from '@screenplay/tasks/clientes-proveedores/clientes/EliminarCliente';
import {generarClienteDNI, generarClienteRUC} from '@data/clientes-proveedores/clientes.data';
import {ClientesTargets} from '@screenplay/targets/clientes-proveedores/ClientesTargets';

test.describe('CL-05 | Eliminación de Clientes', {tag: ['@clientes', '@eliminacion']}, () => {

    test('SC-01: Eliminar cliente sin ventas @CL-05.1', async ({cliente, page}) => {
        const datos = generarClienteRUC();
        await cliente.realiza(CrearCliente(datos));

        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(AbrirAccionContextualCliente('Eliminar cliente'));
        await cliente.realiza(ClickEliminarConfirmar());

        await expect(page.locator('body')).toContainText('El cliente fue eliminado exitosamente');
        await ClientesTargets.btnCerrarModal(page).click();
        await ClientesTargets.btnBorrarFiltros(page).click();

        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await expect(page.getByRole('cell')).toContainText('NO HAY RESULTADOS');
    });
});
