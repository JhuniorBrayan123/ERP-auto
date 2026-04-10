import { test, expect } from '../../../src/fixtures/Logistica/actualizacion-masiva-fixture';
import { ACTUALIZACION_DATOS_CONFIG } from '../../../src/helpers/Logistica/actualizacion-masiva-config.helper';
import {
  buildActualizacionDatosExcel,
  cleanupTempFile,
} from '../../../src/helpers/Logistica/actualizacion-masiva-excel.helper';

const CONFIG = ACTUALIZACION_DATOS_CONFIG.productos;

test.describe('Actualización masiva — datos de productos',{ tag: ['@logistica'] }, () => {
  test('actualizar datos de productos masivamente desde Excel', async ({
    page,
    actualizacionMasiva,
    listaItems,
    itemDetail,
  }) => {
    let tempPath = '';
    let primerCodigo = '';
    let primerNombreEditado = '';

    await test.step('Preparar Excel desde plantilla en src/data (sufijo fecha/hora edición)', async () => {
      const r = await buildActualizacionDatosExcel('productos');
      tempPath = r.tempFilePath;
      primerCodigo = r.primerCodigo;
      primerNombreEditado = r.primerNombreEditado;
    });

    await test.step('Ejecutar wizard: actualizar datos → productos → subir → procesar', async () => {
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

    await test.step('Ver ítem: nombre en detalle y tab Bitácora', async () => {
      await actualizacionMasiva.clickIrAlInicio();
      await listaItems.searchByCode(primerCodigo);
      await itemDetail.abrirMenuAccionesItem();
      await itemDetail.clickVerItem();
      await expect(page.getByText(primerNombreEditado).first()).toBeVisible({
        timeout: 20_000,
      });
      await itemDetail.irATabBitacoraPorTexto();
      await itemDetail.clickAtras();
    });

    cleanupTempFile(tempPath);
  });
});
