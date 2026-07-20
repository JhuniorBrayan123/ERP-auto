import {test, expect} from '@fixtures/clientes-proveedores/clientes.fixture';
import {CrearCliente} from '@screenplay/tasks/clientes-proveedores/clientes/CrearCliente';
import {BuscarClienteEnListado} from '@screenplay/tasks/clientes-proveedores/clientes/BuscarCliente';
import {ToggleSliderEstado} from '@screenplay/tasks/clientes-proveedores/clientes/ToggleEstadoCliente';
import {AbrirBitacora, CerrarDrape, SeleccionarPestaniaBitacora} from '@screenplay/tasks/clientes-proveedores/clientes/NotaAdicionalCliente';
import {
    EstadoClienteEnListado,
    BitacoraContieneAccion,
    SinResultadosBusqueda,
} from '@screenplay/questions/clientes-proveedores/ClienteQuestions';
import {generarClienteDNI, generarClienteInactivo} from '@data/clientes-proveedores/clientes.data';
import {ClientesTargets} from '@screenplay/targets/clientes-proveedores/ClientesTargets';

test.describe('CL-04 | Desactivar/Activar Cliente', {tag: ['@clientes', '@estado']}, () => {

    test('SC-01: Desactivar cliente activo y validar estado + bitácora @CL-04.1', async ({cliente, page}) => {
        // Arrange: Crear cliente activo
        const datos = generarClienteDNI();
        await cliente.realiza(CrearCliente(datos));

        // Act: Buscar y desactivar con slider
        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(ToggleSliderEstado());

        // Assert: Debe aparecer como INACTIVO
        await cliente.realiza(EstadoClienteEnListado('INACTIVO'));

        // Assert: Bitácora registra desactivación
        await cliente.realiza(AbrirBitacora());
        await cliente.realiza(SeleccionarPestaniaBitacora('Actualización'));
        await cliente.realiza(BitacoraContieneAccion('Desactivar cliente'));
        await cliente.realiza(CerrarDrape());
    });

    test('SC-02: Activar cliente inactivo y validar estado + bitácora @CL-04.2', async ({cliente, page}) => {
        // Arrange: Crear cliente con estado Inactivo
        const datos = generarClienteInactivo();
        await cliente.realiza(CrearCliente(datos));

        // Act: Buscar y activar con slider
        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(ToggleSliderEstado());

        // Assert: Limpiar búsqueda y verificar ACTIVO
        await ClientesTargets.btnBorrarFiltros(page).click().catch(() => {});
        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(EstadoClienteEnListado('ACTIVO'));

        // Assert: Bitácora registra activación
        await cliente.realiza(AbrirBitacora());
        await cliente.realiza(SeleccionarPestaniaBitacora('Actualización'));
        await cliente.realiza(BitacoraContieneAccion('Activar cliente'));
        await cliente.realiza(CerrarDrape());
    });
});
