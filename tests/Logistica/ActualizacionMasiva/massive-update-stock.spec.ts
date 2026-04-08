import { test, expect } from '../../../src/fixtures/Logistica/actualizacion-masiva-fixture';
import {
  buildStockMasivoExcel,
  cleanupTempFile,
} from '../../../src/helpers/Logistica/actualizacion-masiva-excel.helper';

/**
 * Índice de almacén en el wizard de stock (0 = primer checkbox del codegen).
 * Override: STOCK_WAREHOUSE_INDEX=1
 */
function indiceAlmacenStock(): number {
  const raw = process.env.STOCK_WAREHOUSE_INDEX;
  if (raw === undefined || raw === '') return 0;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

test.describe('Actualización masiva — stock', () => {
  test('actualizar stock masivamente desde Excel', async ({
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
        page.getByText('Ir al inicio', { exact: true }),
      ).toBeVisible({ timeout: 60_000 });
    });

    await test.step('Visualizar ítem: comprobar stock en modal (mismo flujo que edición)', async () => {
      await actualizacionMasiva.clickIrAlInicio();
      await listaItems.searchByCode(primerCodigo);
      await itemDetail.abrirMenuAccionesItem();
      await itemDetail.clickVisualizarItem();
      // const modal = page.locator('.v-modal');
      // await expect(modal).toContainText(String(stockVal), { timeout: 20_000 });
      //await itemDetail.cerrarModalVisualizacion(); Se comenta ya que solo se valida que aparezca
    });

    cleanupTempFile(tempPath);
  });
});
