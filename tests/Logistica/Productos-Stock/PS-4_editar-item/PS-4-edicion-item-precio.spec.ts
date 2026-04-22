import {test} from '@fixtures/Logistica/edicion-clonado-fixture';
import {generateRandomPrice} from '@helpers/Logistica/random-price.helper';
import {
    confirmarActualizacionItem,
    buscarYVerItemDesdeListado,
} from '@helpers/Logistica/verificaciones-edicion-items.helper';

test.describe('PS-4 | Edición de precio de item', {tag: ['@logistica', '@productos-stock']}, () => {

    test('editar precios de producto existente @PS-4', async ({
                                                            page,
                                                            listaItems,
                                                            edicionItem,
                                                            itemDetail,
                                                        }) => {
        const codigoItem = '889988';
        const nuevoPrecioSoles = generateRandomPrice();
        const nuevoPrecioDolares = generateRandomPrice();

        await test.step('Buscar item por código y abrir edición', async () => {
            await listaItems.searchAndEdit(codigoItem);
        });

        await test.step(`Actualizar precios: S/ ${nuevoPrecioSoles} | $ ${nuevoPrecioDolares}`, async () => {
            await edicionItem.updatePrices(nuevoPrecioSoles, nuevoPrecioDolares);
        });

        await confirmarActualizacionItem(edicionItem);

        await buscarYVerItemDesdeListado(listaItems, itemDetail, codigoItem);

        await test.step('Verificar bitácora del cambio de precios', async () => {
            await itemDetail.irATabBitacora();
        });

        await test.step('Regresar a lista', async () => {
            await itemDetail.clickAtras();
        });
    });
});
