import {test} from '@fixtures/clientes-proveedores/vendedores.fixture';
import {CerrarModalExitoVendedor, CrearVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';
import {
    AbrirAccionContextualVendedor,
    BuscarVendedorEnListado
} from '@screenplay/tasks/clientes-proveedores/vendedores/BuscarVendedor';
import {EliminarVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/EliminarVendedor';
import {
    ClickGuardarCambiosVendedor,
    EditarMetasVendedor,
    EditarNombreVendedor
} from '@screenplay/tasks/clientes-proveedores/vendedores/EditarVendedor';
import {
    BitacoraVendedorContieneAccion,
    MensajeEdicionVendedorExitosaVisible,
    VendedorVisibleEnListado,
} from '@screenplay/questions/clientes-proveedores/VendedorQuestions';
import {generarVendedorRUC} from '@data/clientes-proveedores/vendedores.data';
import {VendedoresTargets} from '@screenplay/targets/clientes-proveedores/VendedoresTargets';

test.describe('VE-03 | Edición de Vendedores', {tag: ['@vendedores', '@edicion']}, () => {

    test('SC-01: Editar nombre y metas del vendedor @VE-03.1', async ({vendedorActor, page}) => {

        const datos = generarVendedorRUC();
        await vendedorActor.realiza(CrearVendedor(datos));
        await vendedorActor.realiza(BuscarVendedorEnListado(datos.numeroDocumento));

        await vendedorActor.realiza(AbrirAccionContextualVendedor('Editar vendedor'));
        const nombreEditado = `${datos.nombreRazonSocial}-editado`;
        await vendedorActor.realiza(EditarNombreVendedor(nombreEditado));

        const nuevaMetaCant = '15000';
        const nuevaMetaMonto = '1500';
        await vendedorActor.realiza(EditarMetasVendedor(nuevaMetaCant, nuevaMetaMonto));
        await vendedorActor.realiza(ClickGuardarCambiosVendedor());
        await vendedorActor.realiza(MensajeEdicionVendedorExitosaVisible());
        await vendedorActor.realiza(CerrarModalExitoVendedor());
        await vendedorActor.realiza(BuscarVendedorEnListado(datos.numeroDocumento));
        await vendedorActor.realiza(VendedorVisibleEnListado(nombreEditado));


        await vendedorActor.realiza(AbrirAccionContextualVendedor('Ver bitácora'));
        await VendedoresTargets.pestaniaBitacora(page, 'Actualización').click();

        await vendedorActor.realiza(BitacoraVendedorContieneAccion(`ahora: ${nombreEditado}`));
        await vendedorActor.realiza(BitacoraVendedorContieneAccion(`ahora: ${nuevaMetaCant}`));
        await vendedorActor.realiza(BitacoraVendedorContieneAccion(`ahora: ${nuevaMetaMonto}`));

        await VendedoresTargets.btnCerrarDrape(page).click();


        await vendedorActor.realiza(EliminarVendedor(datos.numeroDocumento));
    });
});
