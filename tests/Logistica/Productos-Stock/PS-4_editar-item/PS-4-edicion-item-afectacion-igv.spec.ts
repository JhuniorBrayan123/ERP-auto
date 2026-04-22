import {expect, test} from '@fixtures/Logistica/edicion-clonado-fixture';
import {getRandomAffectationType} from '@helpers/Logistica/afectacion-igv.helper';
import {
    confirmarActualizacionItem,
    buscarYVerItemDesdeListado,
} from '@helpers/Logistica/verificaciones-edicion-items.helper';

test.describe('PS-4 | Edición de tipo de afectación de item', {tag: ['@logistica', '@productos-stock']}, () => {

    test('editar tipo de afectación de producto existente @PS-4', async ({
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

        await confirmarActualizacionItem(edicionItem);

        await buscarYVerItemDesdeListado(listaItems, itemDetail, codigoItem);

        await test.step('Verificar tipo de afectación en tab Ventas', async () => {
            await itemDetail.irATabVentas();
            await expect(page.getByText(nuevaAfectacion)).toBeVisible();
        });

        await test.step('Verificar tab Compras', async () => {
            await itemDetail.irATabCompras();
        });

        await test.step('Verificar bitácora del cambio', async () => {
            await itemDetail.irATabBitacora();
        });

        await test.step('Regresar a lista', async () => {
            await itemDetail.clickAtras();
        });
    });
});
