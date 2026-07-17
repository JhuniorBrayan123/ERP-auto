import {test, expect} from '@fixtures/clientes-proveedores/clientes.fixture';
import {CrearCliente} from '@screenplay/tasks/clientes-proveedores/clientes/CrearCliente';
import {generarClienteDNI, generarClienteConCampoAdicional} from '@data/clientes-proveedores/clientes.data';

test.describe('CL-01 | Creación de Clientes', {tag: ['@clientes', '@creacion']}, () => {

    test('SC-01: Crear cliente DNI con datos obligatorios @CL-01.1', async ({cliente}) => {
        const datos = generarClienteDNI();
        await cliente.realiza(CrearCliente(datos));
    });

    test('SC-02: Crear cliente con campo adicional @CL-01.2', async ({cliente}) => {
        const datos = generarClienteConCampoAdicional();
        await cliente.realiza(CrearCliente(datos));
    });
});
