import {expect, test} from '@fixtures/Logistica/actualizacion-masiva-fixture';
import {ACTUALIZACION_DATOS_CONFIG} from '@helpers/Logistica/actualizacion-masiva-config.helper';
import {
    buildActualizacionDatosExcel,
    cleanupTempFile,
} from '@helpers/Logistica/actualizacion-masiva-excel.helper';
import {verificarItemActualizadoEnDetalle} from '@helpers/Logistica/verificaciones-edicion-items.helper';

const CONFIG = ACTUALIZACION_DATOS_CONFIG.insumos;

test.describe('PS-6 | Actualización masiva — datos de insumos', {tag: ['@logistica', '@productos-stock']}, () => {
    test('actualizar datos de insumos masivamente desde Excel @PS-6', async ({
                                                                           page,
                                                                           actualizacionMasiva,
                                                                           listaItems,
                                                                           itemDetail,
                                                                       }) => {
        let tempPath = '';
        let primerCodigo = '';
        let primerNombreEditado = '';

        await test.step('Preparar Excel desde plantilla en src/data', async () => {
            const r = await buildActualizacionDatosExcel('insumos');
            tempPath = r.tempFilePath;
            primerCodigo = r.primerCodigo;
            primerNombreEditado = r.primerNombreEditado;
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
                page.getByText('Ir al inicio', {exact: true}),
            ).toBeVisible({timeout: 60_000});
        });

        await verificarItemActualizadoEnDetalle(
            page,
            actualizacionMasiva,
            listaItems,
            itemDetail,
            primerCodigo,
            primerNombreEditado,
            true // verificarContenidoBitacora = true for insumos and servicios
        );

        cleanupTempFile(tempPath);
    });
});
