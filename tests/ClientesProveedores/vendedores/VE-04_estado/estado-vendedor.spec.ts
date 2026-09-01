import {test} from '@fixtures/clientes-proveedores/vendedores.fixture';
import {CrearVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';
import {
    AbrirAccionContextualVendedor,
    BuscarVendedorEnListado
} from '@screenplay/tasks/clientes-proveedores/vendedores/BuscarVendedor';
import {EliminarVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/EliminarVendedor';
import {ToggleSliderEstadoVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/ToggleEstadoVendedor';
import {EstadoVendedorEnListado,} from '@screenplay/questions/clientes-proveedores/VendedorQuestions';
import {generarVendedorDNI} from '@data/clientes-proveedores/vendedores.data';

test.describe('VE-04 | Estado de Vendedores', {tag: ['@vendedores', '@estado']}, () => {

    test('SC-01: Desactivar y reactivar vendedor @VE-04.1', async ({vendedorActor, page}) => {

        const datos = generarVendedorDNI();
        await vendedorActor.realiza(CrearVendedor(datos));

        await vendedorActor.realiza(BuscarVendedorEnListado(datos.numeroDocumento));
        await vendedorActor.realiza(AbrirAccionContextualVendedor('Desactivar vendedor'));
        await vendedorActor.realiza(ToggleSliderEstadoVendedor('desactivar'));
        await vendedorActor.realiza(BuscarVendedorEnListado(datos.numeroDocumento));
        await vendedorActor.realiza(EstadoVendedorEnListado('INACTIVO'));
        await vendedorActor.realiza(AbrirAccionContextualVendedor('Activar vendedor'));
        await vendedorActor.realiza(ToggleSliderEstadoVendedor('activar'));
        await vendedorActor.realiza(EstadoVendedorEnListado('ACTIVO'));

        await vendedorActor.realiza(EliminarVendedor(datos.numeroDocumento));
    });
});
