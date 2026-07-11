import {expect, test} from '@fixtures/Logistica/edicion-clonado-fixture';
import {buildUniqueItemName} from '@helpers/Logistica/unique-name.helper';
import {
    confirmarActualizacionItem,
    buscarYVerItemDesdeListado,
} from '@helpers/Logistica/verificaciones-edicion-items.helper';

test.describe('PS-04 | Edición de nombre de item', {tag: ['@logistica', '@productos-stock']}, () => {

    test('SC-01: editar nombre de producto existente @PS-04.1', async ({
                                                           page,
                                                           listaItems,
                                                           edicionItem,
                                                           itemDetail,
                                                       }) => {
        const codigoItem = '999999';
        const nuevoNombre = buildUniqueItemName('producto', 'nombre editado');

        await test.step('Buscar item por código y abrir edición', async () => {
            await listaItems.searchAndEdit(codigoItem);
        });

        await test.step('Cambiar nombre del item', async () => {
            await edicionItem.updateName(nuevoNombre);
        });

        await confirmarActualizacionItem(edicionItem);

        await test.step('Verificar nombre actualizado en lista', async () => {
            await listaItems.searchByCode(codigoItem);
            await expect(page.getByRole('table').getByText(nuevoNombre).first()).toBeAttached();
        });

        await buscarYVerItemDesdeListado(listaItems, itemDetail, codigoItem);

        await test.step('Verificar nombre en detalle', async () => {
            await expect(page.getByText(nuevoNombre).first()).toBeVisible();
        });

        await test.step('Verificar bitácora del cambio', async () => {
            await itemDetail.irATabBitacoraPorTexto();
        });

        await test.step('Regresar a lista', async () => {
            await itemDetail.clickAtras();
        });
    });
});
