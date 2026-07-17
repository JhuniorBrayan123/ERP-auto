import {test, expect} from '@fixtures/clientes-proveedores/clientes.fixture';
import {CrearCliente} from '@screenplay/tasks/clientes-proveedores/clientes/CrearCliente';
import {BuscarClienteEnListado} from '@screenplay/tasks/clientes-proveedores/clientes/BuscarCliente';
import {DesactivarCliente, ToggleSliderEstado} from '@screenplay/tasks/clientes-proveedores/clientes/ToggleEstadoCliente';
import {AbrirBitacora, CerrarDrape} from '@screenplay/tasks/clientes-proveedores/clientes/NotaAdicionalCliente';
import {generarClienteDNI} from '@data/clientes-proveedores/clientes.data';
import {ClientesTargets} from '@screenplay/targets/clientes-proveedores/ClientesTargets';

test.describe('CL-04 | Desactivar/Activar Cliente', {tag: ['@clientes', '@estado']}, () => {

    test('SC-01: Desactivar cliente y validar bitácora @CL-04.1', async ({cliente, page}) => {
        const datos = generarClienteDNI();
        await cliente.realiza(CrearCliente(datos));

        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(DesactivarCliente());

        await expect(page.locator('tbody')).toContainText('INACTIVO');

        await cliente.realiza(AbrirBitacora());
        await expect(page.locator('body')).toContainText('Desactivar cliente');
        await cliente.realiza(CerrarDrape());
    });

    test('SC-02: Activar cliente y validar estado @CL-04.2', async ({cliente, page}) => {
        const datos = Object.assign(generarClienteDNI(), {estado: 'Inactivo' as const});
        await cliente.realiza(CrearCliente(datos));

        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(ToggleSliderEstado());
        await ClientesTargets.btnBorrarFiltros(page).click();

        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await expect(page.locator('tbody')).toContainText('ACTIVO');
    });
});
