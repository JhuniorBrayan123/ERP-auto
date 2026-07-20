import {test, expect} from '@fixtures/clientes-proveedores/clientes.fixture';
import {CrearCliente} from '@screenplay/tasks/clientes-proveedores/clientes/CrearCliente';
import {BuscarClienteEnListado} from '@screenplay/tasks/clientes-proveedores/clientes/BuscarCliente';
import {EliminarCliente} from '@screenplay/tasks/clientes-proveedores/clientes/EliminarCliente';
import {ToggleSliderEstado} from '@screenplay/tasks/clientes-proveedores/clientes/ToggleEstadoCliente';
import {AbrirBitacora, CerrarDrape, SeleccionarPestaniaBitacora} from '@screenplay/tasks/clientes-proveedores/clientes/NotaAdicionalCliente';
import {
    EstadoClienteEnListado,
    BitacoraContieneAccion,
    SinResultadosBusqueda,
} from '@screenplay/questions/clientes-proveedores/ClienteQuestions';
import {generarClienteDNI, generarClienteInactivo} from '@data/clientes-proveedores/clientes.data';

test.describe('CL-04 | Desactivar/Activar Cliente', {tag: ['@clientes', '@estado']}, () => {

    test('SC-01: Desactivar cliente activo y validar estado + bitácora @CL-04.1', async ({cliente, page}) => {
        
        const datos = generarClienteDNI();
        await cliente.realiza(CrearCliente(datos));

        
        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(ToggleSliderEstado());

        
        await cliente.realiza(EstadoClienteEnListado('INACTIVO'));

        
        await cliente.realiza(AbrirBitacora());
        await cliente.realiza(SeleccionarPestaniaBitacora('Actualización'));
        await cliente.realiza(BitacoraContieneAccion('Desactivar cliente'));
        await cliente.realiza(CerrarDrape());

        
        await cliente.realiza(EliminarCliente(datos.numeroDocumento));
    });

    test('SC-02: Activar cliente inactivo y validar estado + bitácora @CL-04.2', async ({cliente, page}) => {
        
        const datos = generarClienteInactivo();
        await cliente.realiza(CrearCliente(datos));

        
        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(ToggleSliderEstado());

        
        await cliente.realiza(BuscarClienteEnListado(datos.numeroDocumento));
        await cliente.realiza(EstadoClienteEnListado('ACTIVO'));

        
        await cliente.realiza(AbrirBitacora());
        await cliente.realiza(SeleccionarPestaniaBitacora('Actualización'));
        await cliente.realiza(BitacoraContieneAccion('Activar cliente'));
        await cliente.realiza(CerrarDrape());

        
        await cliente.realiza(EliminarCliente(datos.numeroDocumento));
    });
});
