import {test} from '@fixtures/clientes-proveedores/clientes.fixture';
import {CrearCliente} from '@screenplay/tasks/clientes-proveedores/clientes/CrearCliente';
import {BuscarClienteEnListado, AbrirAccionContextualCliente} from '@screenplay/tasks/clientes-proveedores/clientes/BuscarCliente';
import {EliminarCliente} from '@screenplay/tasks/clientes-proveedores/clientes/EliminarCliente';
import {ClickGuardarCambios, EliminarCampoAdicionalEnFormulario} from '@screenplay/tasks/clientes-proveedores/clientes/EditarCliente';
import {
    AbrirBitacora,
    AbrirDetalleCliente,
    CerrarDrape,
    ClickAtras
} from '@screenplay/tasks/clientes-proveedores/clientes/NotaAdicionalCliente';
import {
    BitacoraContieneAccion,
    ClienteContieneTextoEnDetalle,
    ClienteVisibleEnListado,
    MensajeEdicionVisible,
} from '@screenplay/questions/clientes-proveedores/ClienteQuestions';
import {generarClienteConCampoAdicional, generarClienteDNI} from '@data/clientes-proveedores/clientes.data';
import {ClientesTargets} from '@screenplay/targets/clientes-proveedores/ClientesTargets';

test.describe('CL-01 | Creación de Clientes', {tag: ['@clientes', '@creacion']}, () => {

    test('SC-01: Crear cliente DNI con datos obligatorios @CL-01.1', async ({cliente}) => {
        const datos = generarClienteDNI();

        await cliente.realiza(CrearCliente(datos));

        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(ClienteVisibleEnListado(datos.nombreRazonSocial));

        await cliente.realiza(AbrirBitacora());
        await cliente.realiza(BitacoraContieneAccion('Creación de cliente'));
        await cliente.realiza(CerrarDrape());

        await cliente.realiza(AbrirDetalleCliente());
        await cliente.realiza(ClienteContieneTextoEnDetalle(datos.nombreRazonSocial));
        await cliente.realiza(ClienteContieneTextoEnDetalle(datos.numeroDocumento));
        await cliente.realiza(ClickAtras());

        await cliente.realiza(EliminarCliente(datos.numeroDocumento));
    });

    test('SC-02: Crear cliente con campo adicional y validar en detalle @CL-01.2', async ({cliente, page}) => {
        const datos = generarClienteConCampoAdicional();

        await cliente.realiza(CrearCliente(datos));

        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(ClienteVisibleEnListado(datos.nombreRazonSocial));

        await cliente.realiza(AbrirBitacora());
        await cliente.realiza(BitacoraContieneAccion('Creación de cliente'));
        await cliente.realiza(CerrarDrape());

        await cliente.realiza(AbrirDetalleCliente());
        await cliente.realiza(ClienteContieneTextoEnDetalle(datos.campoAdicional!.nombre));
        await cliente.realiza(ClienteContieneTextoEnDetalle(datos.campoAdicional!.valor));
        await cliente.realiza(ClickAtras());

        
        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(AbrirAccionContextualCliente('Editar cliente'));
        await cliente.realiza(EliminarCampoAdicionalEnFormulario(datos.campoAdicional!.nombre));
        await cliente.realiza(ClickGuardarCambios());
        await cliente.realiza(MensajeEdicionVisible());
        await ClientesTargets.btnCerrarModal(page).click();
        await cliente.realiza(EliminarCliente(datos.numeroDocumento));
    });
});
