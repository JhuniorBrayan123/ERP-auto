import {expect, test} from '@fixtures/Logistica/edicion-clonado-fixture';
import {getRandomAffectationType} from '@helpers/Logistica/afectacion-igv.helper';

test.describe('Edición de tipo de afectación de item', () => {

    test('cambiar el tipo de afectación IGV de un producto existente', async ({
                                                                                  page,
                                                                                  listaItems,
                                                                                  edicionItem,
                                                                                  itemDetail,
                                                                              }) => {
        const codigoItem = '888999';
        const nuevaAfectacion = getRandomAffectationType();

        await test.step('Buscar item por código y abrir edición', async () => {
            await listaItems.searchAndEdit(codigoItem);
        });

        await test.step('Seleccionar nuevo tipo de afectación', async () => {
            await edicionItem.selectAffectationType(nuevaAfectacion);
        });

        await test.step('Confirmar actualización', async () => {
            await edicionItem.clickActualizarProducto();
            await edicionItem.closeSuccessModal();
        });

        await test.step('Buscar item editado por código en la lista', async () => {
            await listaItems.searchByCode(codigoItem);
        });

        await test.step('Abrir Ver Ítem desde la lista', async () => {
            await itemDetail.abrirMenuAccionesItem();
            await itemDetail.clickVerItem();
        });

        await test.step('Verificar tipo de afectación en tab Ventas', async () => {
            await itemDetail.irATabVentas();

        });

        await test.step('Verificar tab Compras', async () => {
            await itemDetail.irATabCompras();
        });

        await test.step('Verificar bitácora del cambio', async () => {
            await itemDetail.irATabBitacora();
            await expect(page.getByText(nuevaAfectacion)).toBeVisible();
        });

        await test.step('Regresar a lista', async () => {
            await itemDetail.clickAtras();
        });
    });
});
