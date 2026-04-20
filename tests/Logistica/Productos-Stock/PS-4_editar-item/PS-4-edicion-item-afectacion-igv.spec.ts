import {expect, test} from '@fixtures/Logistica/edicion-clonado-fixture';
import {getRandomAffectationType} from '@helpers/Logistica/afectacion-igv.helper';

test.describe('PS-4 | Edición de tipo de afectación de item', {tag: ['@logistica', '@productos-stock']}, () => {

    /**
     * Escenario: cambiar el tipo de afectación IGV de un producto existente (código 888999).
     *
     * Flujo:
     * 1. Buscar item por código → abrir edición
     * 2. Abrir dropdown de afectación → scroll dentro del dropdown si necesario
     * 3. Seleccionar nueva afectación (aleatoria de los 17 tipos del sistema)
     * 4. Confirmar actualización
     * 5. Verificar en Ver Ítem (Ventas, Compras, Bitácora) que el cambio persistió
     */
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
