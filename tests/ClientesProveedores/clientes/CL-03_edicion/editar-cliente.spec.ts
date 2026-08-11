import {test} from '@fixtures/clientes-proveedores/clientes.fixture';
import {CrearCliente} from '@screenplay/tasks/clientes-proveedores/clientes/CrearCliente';
import {
    AbrirAccionContextualCliente,
    BuscarClienteEnListado
} from '@screenplay/tasks/clientes-proveedores/clientes/BuscarCliente';
import {EliminarCliente} from '@screenplay/tasks/clientes-proveedores/clientes/EliminarCliente';
import {
    CambiarEstadoClienteEnFormulario,
    ClickGuardarCambios,
    EditarCampoAdicional,
    EditarNombreCliente,
    EliminarCampoAdicionalEnFormulario
} from '@screenplay/tasks/clientes-proveedores/clientes/EditarCliente';
import {
    AbrirBitacora,
    AbrirDetalleCliente,
    CerrarDrape,
    ClickAtras,
    SeleccionarPestaniaBitacora
} from '@screenplay/tasks/clientes-proveedores/clientes/NotaAdicionalCliente';
import {
    BitacoraContieneAccion,
    ClienteContieneTextoEnDetalle,
    ClienteVisibleEnListado,
    MensajeEdicionVisible,
} from '@screenplay/questions/clientes-proveedores/ClienteQuestions';
import {generarClienteParaEdicion} from '@data/clientes-proveedores/clientes.data';
import {ClientesTargets} from '@screenplay/targets/clientes-proveedores/ClientesTargets';

test.describe('CL-03 | Edición de Clientes', {tag: ['@clientes', '@edicion']}, () => {

    test('SC-01: Editar razón social, estado y campo adicional @CL-03.1', async ({cliente, page}) => {

        const datos = generarClienteParaEdicion();
        await cliente.realiza(CrearCliente(datos));
        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(AbrirDetalleCliente());
        await cliente.realiza(ClienteContieneTextoEnDetalle('INACTIVO'));
        await cliente.realiza(ClickAtras());


        await cliente.realiza(AbrirAccionContextualCliente('Editar cliente'));

        const nombreEditado = `${datos.nombreRazonSocial}-editado`;
        const campoEditado = `apodo-editado-${Date.now().toString().slice(-4)}`;

        await cliente.realiza(EditarNombreCliente(nombreEditado));
        await cliente.realiza(CambiarEstadoClienteEnFormulario('Activo'));
        await cliente.realiza(EditarCampoAdicional(datos.campoAdicional!.nombre, campoEditado));
        await cliente.realiza(ClickGuardarCambios());


        await cliente.realiza(MensajeEdicionVisible());
        await ClientesTargets.btnCerrarModal(page).click();


        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(ClienteVisibleEnListado(nombreEditado));


        await cliente.realiza(AbrirBitacora());
        await cliente.realiza(SeleccionarPestaniaBitacora('Actualización'));
        await cliente.realiza(BitacoraContieneAccion('Actualización de cliente'));
        await cliente.realiza(CerrarDrape());


        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(AbrirAccionContextualCliente('Editar cliente'));
        await cliente.realiza(EliminarCampoAdicionalEnFormulario(datos.campoAdicional!.nombre));
        await cliente.realiza(ClickGuardarCambios());
        await cliente.realiza(MensajeEdicionVisible());
        await ClientesTargets.btnCerrarModal(page).click();
        await cliente.realiza(EliminarCliente(datos.numeroDocumento));
    });
});
