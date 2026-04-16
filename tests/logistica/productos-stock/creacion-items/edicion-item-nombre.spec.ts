import {expect, test} from '@fixtures/Logistica/edicion-clonado-fixture';
import {buildUniqueItemName} from '@helpers/Logistica/unique-name.helper';

test.describe('Edición de nombre de item', {tag: ['@logistica', '@productos-stock']}, () => {

    /**
     * Escenario: editar el nombre de un producto existente (código 999999).
     *
     * Flujo:
     * 1. Buscar item por código → abrir edición
     * 2. Cambiar el nombre a uno único con timestamp
     * 3. Confirmar actualización
     * 4. Verificar en Ver Ítem que el nombre cambió
     * 5. Verificar bitácora
     */
    test('editar nombre de producto existente', async ({
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

        await test.step('Confirmar actualización', async () => {
            await edicionItem.clickActualizarProducto();
            await edicionItem.closeSuccessModal();
        });

        await test.step('Buscar item editado por código en la lista', async () => {
            await listaItems.searchByCode(codigoItem);
        });

        await test.step('Verificar nombre actualizado en lista', async () => {
            // El nombre puede estar truncado por CSS elipsis en la columna Nombre
            await expect(page.getByRole('table').getByText(nuevoNombre).first()).toBeAttached();
        });

        await test.step('Abrir Ver Ítem y verificar nombre en detalle', async () => {
            await itemDetail.abrirMenuAccionesItem();
            await itemDetail.clickVerItem();
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
