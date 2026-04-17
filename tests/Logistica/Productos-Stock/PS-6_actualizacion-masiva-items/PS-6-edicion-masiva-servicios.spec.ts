import {expect, test} from '@fixtures/Logistica/actualizacion-masiva-fixture';
import {ACTUALIZACION_DATOS_CONFIG} from '@helpers/Logistica/actualizacion-masiva-config.helper';
import {buildActualizacionDatosExcel, cleanupTempFile,} from '@helpers/Logistica/actualizacion-masiva-excel.helper';

const CONFIG = ACTUALIZACION_DATOS_CONFIG.servicios;

test.describe('PS-6 | Actualización masiva — datos de servicios', {tag: ['@logistica', '@productos-stock']}, () => {
    test('actualizar datos de servicios masivamente desde Excel @PS-6', async ({
                                                                             page,
                                                                             actualizacionMasiva,
                                                                             listaItems,
                                                                             itemDetail,
                                                                         }) => {
        let tempPath = '';
        let primerCodigo = '';
        let primerNombreEditado = '';

        await test.step('Preparar Excel desde plantilla en src/data', async () => {
            const r = await buildActualizacionDatosExcel('servicios');
            tempPath = r.tempFilePath;
            primerCodigo = r.primerCodigo;
            primerNombreEditado = r.primerNombreEditado;
        });

        await test.step('Ejecutar wizard: actualizar datos → servicios → subir → procesar', async () => {
            await actualizacionMasiva.ejecutarActualizacionDatosItem(
                CONFIG.cardLabel,
                tempPath,
                CONFIG.columnMappings,
            );
        });

        await test.step('Confirmar pantalla de éxito', async () => {
            await expect(
                page.getByText('Ir al inicio', {exact: true}),
            ).toBeVisible({timeout: 60_000});
        });

        await test.step('Ver ítem: nombre en detalle y tab Bitácora', async () => {
            await actualizacionMasiva.clickIrAlInicio();
            await listaItems.searchByCode(primerCodigo);
            await itemDetail.abrirMenuAccionesItem();
            await itemDetail.clickVerItem();
            await expect(page.getByText(primerNombreEditado).first()).toBeVisible({
                timeout: 30_000,
            });
            await itemDetail.irATabBitacoraPorTexto();
            await expect(
                page.locator('.bitacora, [class*="bitacora"]').first(),
            ).toContainText(primerNombreEditado, {timeout: 45_000});
            await itemDetail.clickAtras();
        });

        cleanupTempFile(tempPath);
    });
});
