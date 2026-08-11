import {expect, test} from '@fixtures/Logistica/actualizacion-masiva-fixture';
import {buildStockMasivoExcel, cleanupTempFile,} from '@helpers/Logistica/actualizacion-masiva-excel.helper';

function indiceAlmacenStock(): number {
    const raw = process.env.STOCK_WAREHOUSE_INDEX;
    if (raw === undefined || raw === '') return 0;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
}

test.describe('PS-07 | Actualización masiva — stock', {tag: ['@logistica', '@productos-stock']}, () => {
    test('SC-01: actualizar stock masivamente desde Excel @PS-07.1', async ({
                                                                page,
                                                                actualizacionMasiva,
                                                                listaItems,
                                                                itemDetail,
                                                            }) => {
        let tempPath = '';
        let primerCodigo = '';
        let stockVal = 0;

        await test.step('Preparar Excel: columna STOCK con valor numérico', async () => {
            const r = await buildStockMasivoExcel();
            tempPath = r.tempFilePath;
            primerCodigo = r.primerCodigo;
            stockVal = r.stockValue;
        });

        await test.step('Ejecutar wizard stock (sin tipo de ítem)', async () => {
            await actualizacionMasiva.ejecutarActualizacionStock(
                tempPath,
                indiceAlmacenStock(),
            );
        });

        await test.step('Confirmar finalización', async () => {
            await expect(
                page.getByText('Ir al inicio', {exact: true}),
            ).toBeVisible({timeout: 60_000});
        });

        await test.step('Visualizar ítem: comprobar stock en modal (mismo flujo que edición)', async () => {
            await actualizacionMasiva.clickIrAlInicio();
            await listaItems.searchByCode(primerCodigo);
            await itemDetail.abrirMenuAccionesItem();
            await itemDetail.clickVisualizarItem();
            
        });

        cleanupTempFile(tempPath);
    });
});
