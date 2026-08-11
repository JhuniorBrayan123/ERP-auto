import * as fs from 'node:fs';
import ExcelJS from 'exceljs';

/**
 * Headers conocidos del reporte de ventas (validación best-effort,
 * case-insensitive, informativa). La doc BookStack (FCT Reporte — Resumen de
 * Ventas) NO define el formato del Excel exportado, por eso la validación real
 * es estructural. La lista combina los headers sugeridos en el spec con los
 * descubiertos contra la app real en apply (Resumen de ventas: N°, Sucursal/Caja,
 * Boleta, Factura, Nota de venta, Total, Anulaciones, Nota de crédito, Nota de débito).
 */
export const HEADERS_CONOCIDOS_REPORTE = [
    // Spec original (best-effort, formato no definido en docs).
    'comprobante',
    'moneda',
    'total',
    'fecha',
    'ítem',
    'cliente',
    'método',
    // Descubiertos contra la app real (apply): formato real del Resumen de ventas.
    'sucursal',
    'caja',
    'boleta',
    'factura',
    'nota de venta',
    'anulaciones',
    'nota de crédito',
    'nota de débito',
] as const;

export interface ExcelReporteResultado {
    ok: boolean;
    detalle: string[];
    hojas: number;
    filaHeaders: number;
    headers: string[];
    filasConDatos: number;
    headersConocidosEncontrados: string[];
}

/** Limpieza best-effort de archivos temporales de descarga (nunca en el repo). */
export function eliminarArchivoTemporal(rutaArchivo: string): void {
    try {
        if (fs.existsSync(rutaArchivo)) {
            fs.unlinkSync(rutaArchivo);
        }
    } catch {
        // Si falla, el SO reclamará el archivo en temp; no bloquear el caso.
    }
}

function normalizar(texto: string): string {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

/** Extrae texto de una celda manejando rich text y objetos vacíos (ej. "{}"). */
function valorCeldaTexto(cell: ExcelJS.Cell): string {
    const value = cell.value;
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') {
        const rich = (value as { richText?: Array<{ text?: string }> }).richText;
        if (Array.isArray(rich)) {
            return rich.map((t) => t.text ?? '').join('');
        }
        // Objetos sin texto útil (p. ej. rich text vacío de merges de formato).
        return '';
    }
    return String(value);
}

/**
 * Validación estructural del Excel del Reporte de Ventas (exceljs).
 * Adaptada al formato REAL descubierto en apply (Resumen de ventas):
 * la fila 1 es un título mergeado, las filas 2-7 pueden ser resúmenes/merges
 * vacíos y los headers reales están en una fila posterior, con los datos debajo.
 *
 * Reglas:
 * 1. readFile sin error.
 * 2. worksheets.length >= 1.
 * 3. Detección de fila de headers: la fila con MAYOR cantidad de valores
 *    distintos no vacíos (>= 2), descartando títulos mergeados y filas vacías.
 *    Fallback estructural: fila 1.
 * 4. Headers no vacíos; debe haber >= 1 fila de datos debajo de la fila de
 *    headers (solo-headers es válido únicamente en modo tolerante / sin datos).
 * 5. Best-effort case-insensitive de headers conocidos (informativo, con
 *    fallback estructural). NO se asertan montos ni nombres de columna exactos.
 */
export async function validarEstructuraExcelReporte(
    rutaArchivo: string,
    opciones: { tolerarSinDatos?: boolean } = {},
): Promise<ExcelReporteResultado> {
    const detalle: string[] = [];
    const headers: string[] = [];
    const headersConocidosEncontrados: string[] = [];
    let ok = true;
    let hojas = 0;
    let filaHeaders = 0;
    let filasConDatos = 0;

    try {
        // (1) Debe poder leerse como Excel sin errores.
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(rutaArchivo);

        // (2) Al menos una hoja de cálculo.
        hojas = workbook.worksheets.length;
        if (hojas < 1) {
            ok = false;
            detalle.push('El Excel no contiene hojas de cálculo');
        }

        const hojaActiva = workbook.worksheets[0] ?? workbook.addWorksheet('hoja1');

        // (3) Detección de la fila de headers: la fila con más celdas "tipo
        // header" (texto sin dígitos) y >= 2 valores distintos. Esto descarta
        // títulos mergeados (1 valor distinto), filas vacías/merges de formato y
        // filas de DATOS (montos con dígitos, p. ej. "S/9743.88"). Ante empate
        // gana la fila más temprana (los headers reales preceden a los datos).
        const candidatas: Array<{ fila: number; valores: string[]; celdasTipoHeader: number }> = [];
        hojaActiva.eachRow({ includeEmpty: false }, (row, rowNum) => {
            const distintos = new Set<string>();
            let celdasTipoHeader = 0;
            row.eachCell({ includeEmpty: false }, (cell) => {
                const texto = valorCeldaTexto(cell).trim();
                if (!texto) return;
                distintos.add(texto);
                if (!/\d/.test(texto)) celdasTipoHeader++;
            });
            if (distintos.size >= 2) {
                candidatas.push({ fila: rowNum, valores: [...distintos], celdasTipoHeader });
            }
        });

        if (candidatas.length > 0) {
            candidatas.sort((a, b) =>
                b.celdasTipoHeader - a.celdasTipoHeader ||
                b.valores.length - a.valores.length,
            );
            filaHeaders = candidatas[0].fila;
            headers.push(...candidatas[0].valores);
            detalle.push(`Fila de headers detectada: fila ${filaHeaders} (${headers.length} headers distintos)`);
        } else {
            // Fallback estructural: fila 1.
            filaHeaders = 1;
            const distintos = new Set<string>();
            hojaActiva.getRow(1).eachCell({ includeEmpty: false }, (cell) => {
                const texto = valorCeldaTexto(cell).trim();
                if (texto) distintos.add(texto);
            });
            headers.push(...distintos);
            detalle.push('Sin fila de headers clara — fallback estructural sobre la fila 1');
        }

        // (4a) Headers no vacíos.
        if (headers.length === 0) {
            ok = false;
            detalle.push('No se detectaron headers no vacíos');
        } else {
            detalle.push(`Headers (${headers.length}): ${headers.join(' | ')}`);
        }

        // (5) Best-effort case-insensitive de headers conocidos (informativo).
        for (const conocido of HEADERS_CONOCIDOS_REPORTE) {
            const target = normalizar(conocido);
            if (headers.some((header) => normalizar(header).includes(target))) {
                headersConocidosEncontrados.push(conocido);
            }
        }
        if (headersConocidosEncontrados.length > 0) {
            detalle.push(`Headers conocidos del reporte encontrados: ${headersConocidosEncontrados.join(', ')}`);
        } else {
            detalle.push('Sin headers conocidos del reporte de ventas — validación estructural aplicada');
        }

        // (4b) Datos: al menos una fila con celdas no vacías debajo de los headers.
        const filasConValores: number[] = [];
        hojaActiva.eachRow({ includeEmpty: false }, (row, rowNum) => {
            if (rowNum <= filaHeaders) return;
            let celdas = 0;
            row.eachCell({ includeEmpty: false }, (cell) => {
                if (valorCeldaTexto(cell).trim()) celdas++;
            });
            if (celdas > 0) filasConValores.push(rowNum);
        });
        filasConDatos = filasConValores.length;

        if (filasConDatos > 0) {
            detalle.push(`Filas con datos debajo de los headers: ${filasConValores.join(', ')}`);
        } else if (opciones.tolerarSinDatos) {
            detalle.push('Sin filas de datos debajo de los headers — tolerado (estado sin datos)');
        } else {
            ok = false;
            detalle.push('No hay filas de datos debajo de la fila de headers (estado sin datos)');
        }
    } catch (error) {
        ok = false;
        detalle.push(
            `No se pudo leer el archivo como Excel: ${error instanceof Error ? error.message : String(error)}`,
        );
    }

    return {
        ok,
        detalle,
        hojas,
        filaHeaders,
        headers,
        filasConDatos,
        headersConocidosEncontrados,
    };
}
