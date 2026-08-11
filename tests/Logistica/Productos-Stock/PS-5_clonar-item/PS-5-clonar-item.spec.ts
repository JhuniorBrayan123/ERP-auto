import {expect, test} from '@fixtures/Logistica/edicion-clonado-fixture';
import {buildUniqueClonedItemName} from '@helpers/Logistica/nombre-clonado.helper';
import {getCodigo} from '@factories/item-factory';

test.describe('PS-05 | Clonado de item', {tag: ['@logistica', '@productos-stock']}, () => {

    test('SC-01: clonar producto existente con nombre único @PS-05.1', async ({
                                                                        page,
                                                                        listaItems,
                                                                        edicionItem,
                                                                    }) => {
        const codigoItemOrigen = getCodigo('PRODUCTO_SIMPLE').replace(/-/g, '');
        const nombreClonado = buildUniqueClonedItemName('item para clonacion');

        await test.step('Buscar item origen por código y abrir clonado', async () => {
            await listaItems.searchAndClone(codigoItemOrigen);
        });

        await test.step('Reemplazar nombre con nombre único de clonado', async () => {
            await edicionItem.updateName(nombreClonado);
        });

        await test.step('Confirmar clonado', async () => {
            await edicionItem.clickClonarProducto();
        });

        await test.step('Ir a lista de ítems', async () => {
            await edicionItem.clickIrAListaItems();
        });

        await test.step('Verificar item clonado visible en lista', async () => {
            await page.getByText('Estamos cargando tus ítems...').waitFor({state: 'hidden', timeout: 25000});
            await expect(page.getByRole('table').getByText(nombreClonado).first()).toBeAttached();
        });
    });
});
