import {test, expect} from '@fixtures/clientes-proveedores/clientes.fixture';
import {CrearCliente, CerrarModalExito} from '@screenplay/tasks/clientes-proveedores/clientes/CrearCliente';
import {BuscarClienteEnListado} from '@screenplay/tasks/clientes-proveedores/clientes/BuscarCliente';
import {AbrirDetalleCliente, AbrirBitacora, CerrarDrape, ClickAtras} from '@screenplay/tasks/clientes-proveedores/clientes/NotaAdicionalCliente';
import {
    ClienteVisibleEnListado,
    ClienteContieneTextoEnDetalle,
    BitacoraContieneAccion,
} from '@screenplay/questions/clientes-proveedores/ClienteQuestions';
import {generarClienteDNI, generarClienteConCampoAdicional} from '@data/clientes-proveedores/clientes.data';

test.describe('CL-01 | Creación de Clientes', {tag: ['@clientes', '@creacion']}, () => {

    test('SC-01: Crear cliente DNI con datos obligatorios @CL-01.1', async ({cliente}) => {
        const datos = generarClienteDNI();

        // Act: Crear cliente
        await cliente.realiza(CrearCliente(datos));

        // Assert: Validar aparición en listado
        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(ClienteVisibleEnListado(datos.nombreRazonSocial));

        // Assert: Validar bitácora de creación
        await cliente.realiza(AbrirBitacora());
        await cliente.realiza(BitacoraContieneAccion('Creación de cliente'));
        await cliente.realiza(CerrarDrape());

        // Assert: Validar detalle del cliente
        await cliente.realiza(AbrirDetalleCliente());
        await cliente.realiza(ClienteContieneTextoEnDetalle(datos.nombreRazonSocial));
        await cliente.realiza(ClienteContieneTextoEnDetalle(datos.numeroDocumento));
        await cliente.realiza(ClickAtras());
    });

    test('SC-02: Crear cliente con campo adicional y validar en detalle @CL-01.2', async ({cliente}) => {
        const datos = generarClienteConCampoAdicional();

        // Act: Crear cliente con campo adicional
        await cliente.realiza(CrearCliente(datos));

        // Assert: Validar aparición en listado
        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(ClienteVisibleEnListado(datos.nombreRazonSocial));

        // Assert: Validar bitácora
        await cliente.realiza(AbrirBitacora());
        await cliente.realiza(BitacoraContieneAccion('Creación de cliente'));
        await cliente.realiza(CerrarDrape());

        // Assert: Validar detalle con campo adicional
        await cliente.realiza(AbrirDetalleCliente());
        await cliente.realiza(ClienteContieneTextoEnDetalle(datos.campoAdicional!.nombre));
        await cliente.realiza(ClienteContieneTextoEnDetalle(datos.campoAdicional!.valor));
        await cliente.realiza(ClickAtras());
    });
});
