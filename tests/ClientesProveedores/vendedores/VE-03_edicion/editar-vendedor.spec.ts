import {test, expect} from '@fixtures/clientes-proveedores/vendedores.fixture';
import {CrearVendedor, CerrarModalExitoVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';
import {BuscarVendedorEnListado, AbrirAccionContextualVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/BuscarVendedor';
import {EditarNombreVendedor, EditarMetasVendedor, ClickGuardarCambiosVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/EditarVendedor';
import {
    VendedorVisibleEnListado,
    MensajeEdicionVendedorExitosaVisible,
    BitacoraVendedorContieneAccion,
} from '@screenplay/questions/clientes-proveedores/VendedorQuestions';
import {generarVendedorRUC} from '@data/clientes-proveedores/vendedores.data';
import {VendedoresTargets} from '@screenplay/targets/clientes-proveedores/VendedoresTargets';

test.describe('VE-03 | Edición de Vendedores', {tag: ['@vendedores', '@edicion']}, () => {

    test('SC-01: Editar nombre y metas del vendedor @VE-03.1', async ({vendedorActor, page}) => {
        // Arrange
        const datos = generarVendedorRUC();
        await vendedorActor.realiza(CrearVendedor(datos));
        await vendedorActor.realiza(BuscarVendedorEnListado(datos.numeroDocumento));

        // Act
        await vendedorActor.realiza(AbrirAccionContextualVendedor('Editar vendedor'));

        const nombreEditado = `${datos.nombreRazonSocial}-editado`;
        await vendedorActor.realiza(EditarNombreVendedor(nombreEditado));
        
        const nuevaMetaCant = '15000';
        const nuevaMetaMonto = '1500';
        await vendedorActor.realiza(EditarMetasVendedor(nuevaMetaCant, nuevaMetaMonto));

        await vendedorActor.realiza(ClickGuardarCambiosVendedor());

        // Assert: Mensaje de éxito
        await vendedorActor.realiza(MensajeEdicionVendedorExitosaVisible());
        await vendedorActor.realiza(CerrarModalExitoVendedor());

        // Assert: Nombre actualizado en listado
        await vendedorActor.realiza(BuscarVendedorEnListado(datos.numeroDocumento));
        await vendedorActor.realiza(VendedorVisibleEnListado(nombreEditado));

        // Assert: Bitácora
        await vendedorActor.realiza(AbrirAccionContextualVendedor('Ver bitácora'));
        await VendedoresTargets.pestaniaBitacora(page, 'Actualización').click();
        
        await vendedorActor.realiza(BitacoraVendedorContieneAccion(`ahora: ${nombreEditado}`));
        await vendedorActor.realiza(BitacoraVendedorContieneAccion(`ahora: ${nuevaMetaCant}`));
        await vendedorActor.realiza(BitacoraVendedorContieneAccion(`ahora: ${nuevaMetaMonto}`));
        
        await VendedoresTargets.btnCerrarDrape(page).click();
    });
});
