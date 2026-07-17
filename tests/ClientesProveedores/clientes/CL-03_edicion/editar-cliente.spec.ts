import {test, expect} from '@fixtures/clientes-proveedores/clientes.fixture';
import {CrearCliente, CerrarModalExito, LlenarNombreRazonSocialCliente} from '@screenplay/tasks/clientes-proveedores/clientes/CrearCliente';
import {BuscarClienteEnListado, AbrirAccionYEsperarDrape} from '@screenplay/tasks/clientes-proveedores/clientes/BuscarCliente';
import {ClickGuardarCambios, CambiarEstadoClienteEnFormulario} from '@screenplay/tasks/clientes-proveedores/clientes/EditarCliente';
import {AbrirDetalleCliente, AbrirBitacora, CerrarDrape, ClickAtras} from '@screenplay/tasks/clientes-proveedores/clientes/NotaAdicionalCliente';
import {generarClienteDNI} from '@data/clientes-proveedores/clientes.data';
import {ClientesTargets} from '@screenplay/targets/clientes-proveedores/ClientesTargets';

test.describe('CL-03 | Edición de Clientes', {tag: ['@clientes', '@edicion']}, () => {

    test('SC-01: Editar nombre y verificar en listado y bitácora @CL-03.1', async ({cliente, page}) => {
        const datos = generarClienteDNI();
        await cliente.realiza(CrearCliente(datos));

        // Buscar y editar
        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(AbrirAccionYEsperarDrape('Ver cliente'));
        await expect(ClientesTargets.appContainer(page)).toContainText(datos.nombreRazonSocial);
        await cliente.realiza(ClickAtras());

        // Editar
        await cliente.realiza(async (p: typeof page) => {
            await ClientesTargets.botonContextual(p).click();
            await p.getByText('Editar cliente').click();
        });
        const nombreEditado = `${datos.nombreRazonSocial}-editado`;
        await cliente.realiza(LlenarNombreRazonSocialCliente(nombreEditado));
        await cliente.realiza(ClickGuardarCambios());
        await expect(page.locator('body')).toContainText('Los cambios se guardaron exitosamente');
        await ClientesTargets.btnCerrarModal(page).click();

        // Validar en listado
        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await expect(ClientesTargets.tbody(page)).toContainText(nombreEditado);

        // Validar en bitácora
        await cliente.realiza(AbrirBitacora());
        await expect(page.locator('body')).toContainText('Actualización de cliente');
        await cliente.realiza(CerrarDrape());
    });
});
