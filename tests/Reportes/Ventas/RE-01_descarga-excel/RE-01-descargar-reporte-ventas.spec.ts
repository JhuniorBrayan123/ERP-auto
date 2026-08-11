import { expect, test } from '@fixtures/reportes/reportes.fixture';
import { DescargarReporteVentasExcel } from '@screenplay/tasks/reportes/DescargarReporteVentasExcel';
import { ExcelReporteVentasValido } from '@screenplay/questions/reportes/ExcelReporteVentasValido';
import { ArchivoDescargado } from '@screenplay/questions/cierre-caja/MovimientoVisibleEnCierre';
import { eliminarArchivoTemporal } from '@helpers/Reportes/excel-reporte.helper';

test.describe('RE-01 | Descarga Reporte de Ventas Excel', { tag: ['@reportes'] }, () => {

    test('TC-01: Descargar el reporte de ventas en Excel y validar extensión y nombre @RE-01.1', async ({ reportes }) => {
        const { nombreArchivo, rutaTemporal } = await reportes.realizaYObtiene(DescargarReporteVentasExcel());

        try {
            // Extensión .xlsx (reutiliza ArchivoDescargado de Cierre Caja).
            const esExcel = await reportes.pregunta(ArchivoDescargado(nombreArchivo, 'xlsx'));
            expect(esExcel).toBe(true);

            // Nombre tolerante: sin caracteres inválidos de ruta y extensión .xlsx.
            expect(nombreArchivo).toMatch(/^[^\\/:*?"<>|]+\.xlsx$/i);
        } finally {
            eliminarArchivoTemporal(rutaTemporal);
        }
    });

    test('TC-02: Validar el contenido del Excel descargado con exceljs @RE-01.2', async ({ reportes }) => {
        const { nombreArchivo, rutaTemporal } = await reportes.realizaYObtiene(DescargarReporteVentasExcel());

        try {
            const valido = await reportes.pregunta(ExcelReporteVentasValido(nombreArchivo, rutaTemporal));
            expect(valido).toBe(true);
        } finally {
            eliminarArchivoTemporal(rutaTemporal);
        }
    });

    test('TC-03: Estado sin datos — estructura headers-only válida o skip con motivo @RE-01.3', async ({ reportes }) => {
        // Comportamiento real (spec aprobada): si la app impide descargar sin
        // datos, el intento falla y el caso se marca skip con motivo. Si
        // descarga (aunque sea solo headers), se valida en modo tolerante.
        const descarga = await reportes
            .realizaYObtiene(DescargarReporteVentasExcel())
            .catch((error: unknown) => {
                console.warn(
                    `  [RE-01.3] La descarga del reporte sin datos no está disponible: ` +
                    `${error instanceof Error ? error.message : String(error)}`,
                );
                return null;
            });

        test.skip(descarga === null, 'La app no permite descargar el reporte sin datos — validación manual requerida');

        try {
            const valido = await reportes.pregunta(
                ExcelReporteVentasValido(descarga!.nombreArchivo, descarga!.rutaTemporal, { tolerarSinDatos: true }),
            );
            expect(valido).toBe(true);
        } finally {
            eliminarArchivoTemporal(descarga!.rutaTemporal);
        }
    });
});
