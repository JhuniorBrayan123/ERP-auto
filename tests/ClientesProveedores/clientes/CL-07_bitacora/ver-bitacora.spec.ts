import {test, expect} from '@fixtures/clientes-proveedores/clientes.fixture';
import {CrearCliente} from '@screenplay/tasks/clientes-proveedores/clientes/CrearCliente';
import {BuscarClienteEnListado} from '@screenplay/tasks/clientes-proveedores/clientes/BuscarCliente';
import {ToggleSliderEstado} from '@screenplay/tasks/clientes-proveedores/clientes/ToggleEstadoCliente';
import {
    AbrirBitacora,
    AbrirNotasAdicionales,
    AgregarNotaDesdePanel,
    EliminarNotaAdicional,
    CerrarDrape,
    SeleccionarPestaniaBitacora,
} from '@screenplay/tasks/clientes-proveedores/clientes/NotaAdicionalCliente';
import {
    BitacoraContieneAccion,
} from '@screenplay/questions/clientes-proveedores/ClienteQuestions';
import {generarClienteDNI, generarNota} from '@data/clientes-proveedores/clientes.data';

test.describe('CL-07 | Bitácora de Cliente', {tag: ['@clientes', '@bitacora']}, () => {

    test('SC-01: Validar historial completo en bitácora @CL-07.1', async ({cliente}) => {
        // Arrange: Crear cliente
        const datos = generarClienteDNI();
        const nota = generarNota();
        await cliente.realiza(CrearCliente(datos));
        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));

        // Generar eventos: desactivar → activar (genera entradas de Actualización)
        await cliente.realiza(ToggleSliderEstado()); // Desactivar
        await cliente.realiza(ToggleSliderEstado()); // Reactivar

        // Generar evento: agregar nota → eliminar nota (genera entradas de Eliminación)
        await cliente.realiza(AbrirNotasAdicionales());
        await cliente.realiza(AgregarNotaDesdePanel(nota.titulo, nota.mensaje));
        await cliente.realiza(EliminarNotaAdicional());
        await cliente.realiza(CerrarDrape());

        // Act: Abrir bitácora
        await cliente.realiza(AbrirBitacora());

        // Assert: Pestaña Creación
        await cliente.realiza(SeleccionarPestaniaBitacora('Creación'));
        await cliente.realiza(BitacoraContieneAccion('Creación de cliente'));

        // Assert: Pestaña Actualización (desactivar + activar)
        await cliente.realiza(SeleccionarPestaniaBitacora('Actualización'));
        await cliente.realiza(BitacoraContieneAccion('Desactivar cliente'));
        await cliente.realiza(BitacoraContieneAccion('Activar cliente'));

        // Assert: Pestaña Eliminación (nota eliminada)
        await cliente.realiza(SeleccionarPestaniaBitacora('Eliminación'));
        await cliente.realiza(BitacoraContieneAccion('Eliminación de nota adicional'));

        await cliente.realiza(CerrarDrape());
    });
});
