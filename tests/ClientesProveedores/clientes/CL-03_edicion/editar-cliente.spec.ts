import {test, expect} from '@fixtures/clientes-proveedores/clientes.fixture';
import {CrearCliente, CerrarModalExito} from '@screenplay/tasks/clientes-proveedores/clientes/CrearCliente';
import {BuscarClienteEnListado, AbrirAccionContextualCliente} from '@screenplay/tasks/clientes-proveedores/clientes/BuscarCliente';
import {EditarNombreCliente, EditarCampoAdicional, ClickGuardarCambios, CambiarEstadoClienteEnFormulario} from '@screenplay/tasks/clientes-proveedores/clientes/EditarCliente';
import {AbrirDetalleCliente, AbrirBitacora, CerrarDrape, ClickAtras, SeleccionarPestaniaBitacora} from '@screenplay/tasks/clientes-proveedores/clientes/NotaAdicionalCliente';
import {
    ClienteVisibleEnListado,
    ClienteContieneTextoEnDetalle,
    MensajeEdicionVisible,
    BitacoraContieneAccion,
    EstadoClienteEnListado,
} from '@screenplay/questions/clientes-proveedores/ClienteQuestions';
import {generarClienteParaEdicion} from '@data/clientes-proveedores/clientes.data';
import {ClientesTargets} from '@screenplay/targets/clientes-proveedores/ClientesTargets';

test.describe('CL-03 | Edición de Clientes', {tag: ['@clientes', '@edicion']}, () => {

    test('SC-01: Editar razón social, estado y campo adicional @CL-03.1', async ({cliente, page}) => {
        // Arrange: Crear cliente con estado Inactivo y campo adicional
        const datos = generarClienteParaEdicion();
        await cliente.realiza(CrearCliente(datos));

        // Validar estado Inactivo en detalle
        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(AbrirDetalleCliente());
        await cliente.realiza(ClienteContieneTextoEnDetalle('INACTIVO'));
        await cliente.realiza(ClickAtras());

        // Act: Abrir edición
        await cliente.realiza(AbrirAccionContextualCliente('Editar cliente'));

        const nombreEditado = `${datos.nombreRazonSocial}-editado`;
        const campoEditado = `apodo-editado-${Date.now().toString().slice(-4)}`;

        await cliente.realiza(EditarNombreCliente(nombreEditado));
        await cliente.realiza(CambiarEstadoClienteEnFormulario('Activo'));
        await cliente.realiza(EditarCampoAdicional(campoEditado));
        await cliente.realiza(ClickGuardarCambios());

        // Assert: Mensaje de éxito
        await cliente.realiza(MensajeEdicionVisible());
        await ClientesTargets.btnCerrarModal(page).click();

        // Assert: Nombre actualizado en listado
        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(ClienteVisibleEnListado(nombreEditado));

        // Assert: Bitácora de actualización con detalles
        await cliente.realiza(AbrirBitacora());
        await cliente.realiza(SeleccionarPestaniaBitacora('Actualización'));
        await cliente.realiza(BitacoraContieneAccion('Actualización de cliente'));
        await cliente.realiza(CerrarDrape());
    });
});
