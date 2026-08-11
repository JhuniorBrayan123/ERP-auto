import { type Page } from '@playwright/test';
import { ArchivoDescargado } from '@screenplay/questions/cierre-caja/MovimientoVisibleEnCierre';
import { validarEstructuraExcelReporte } from '@helpers/Reportes/excel-reporte.helper';

/**
 * ¿El archivo descargado es un Reporte de Ventas Excel válido?
 * - Nombre/extensión .xlsx: reutiliza ArchivoDescargado (sin duplicar lógica).
 * - Contenido: delega la validación estructural al helper exceljs
 *   (hojas + headers + datos, tolerante al formato no definido en docs).
 */
export const ExcelReporteVentasValido = (
    nombreArchivo: string,
    rutaTemporal: string,
    opciones?: { tolerarSinDatos?: boolean },
) => {
    const fn = async (page: Page): Promise<boolean> => {
        const nombreValido = await ArchivoDescargado(nombreArchivo, 'xlsx')(page);
        if (!nombreValido) return false;

        const resultado = await validarEstructuraExcelReporte(rutaTemporal, opciones);
        console.log(`  [ExcelReporteVentasValido] ${resultado.detalle.join(' | ')}`);
        return resultado.ok;
    };

    fn.displayName = `¿El archivo "${nombreArchivo}" es un Reporte de Ventas Excel válido?`;
    return fn;
};
