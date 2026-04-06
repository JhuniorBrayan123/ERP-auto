import { test, expect } from '../fixtures/actualizacion-masiva-fixture';
import { ACTUALIZACION_DATOS_CONFIG } from '../helpers/actualizacion-masiva-config.helper';
import {
  buildActualizacionDatosExcel,
  cleanupTempFile,
} from '../helpers/actualizacion-masiva-excel.helper';

const CONFIG = ACTUALIZACION_DATOS_CONFIG.insumos;

test.describe('Actualización masiva — datos de insumos', () => {
  test('actualizar datos de insumos masivamente desde Excel', async ({
    page,
    actualizacionMasiva,
    listaItems,
    itemDetail,
  }) => {
    let tempPath = '';
    let primerCodigo = '';
    let textoBusqueda = '';

    await test.step('Preparar Excel desde plantilla en src/data', async () => {
      const r = await buildActualizacionDatosExcel('insumos');
      tempPath = r.tempFilePath;
      primerCodigo = r.primerCodigo;
      textoBusqueda = r.textoBusqueda;
    });

    await test.step('Ejecutar wizard: actualizar datos → insumos → subir → procesar', async () => {
      await actualizacionMasiva.ejecutarActualizacionDatosItem(
        CONFIG.cardLabel,
        tempPath,
        CONFIG.columnMappings,
      );
    });

    await test.step('Confirmar pantalla de éxito', async () => {
      await expect(
        page.getByText('Ir al inicio', { exact: true }),
      ).toBeVisible({ timeout: 60_000 });
    });

    await test.step('Ver ítem: bitácora refleja la edición masiva', async () => {
      await actualizacionMasiva.clickIrAlInicio();
      await listaItems.searchByCode(primerCodigo);
      await itemDetail.abrirMenuAccionesItem();
      await itemDetail.clickVerItem();
      await itemDetail.irATabBitacoraPorTexto();
      await expect(
        page.locator('.bitacora, [class*="bitacora"]').first(),
      ).toContainText(textoBusqueda, { timeout: 25_000 });
      await itemDetail.clickAtras();
    });

    cleanupTempFile(tempPath);
  });
});
