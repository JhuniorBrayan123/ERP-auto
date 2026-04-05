import * as path from 'node:path';
import * as fs from 'node:fs';
import * as os from 'node:os';
import { randomInt } from 'node:crypto';
import ExcelJS from 'exceljs';
import {
  type TipoItemMasivo,
  type MasivoItemConfig,
  MASIVO_CONFIG,
  resolveExcelPath,
} from './masivo-config.helper';

/**
 * Resultado de preparar un Excel para carga masiva.
 *
 * - tempFilePath: ruta del archivo temporal generado (para setInputFiles)
 * - nombreGenerado: valor completo en la columna nombre (incluye #fila)
 * - textoBusqueda: marca de tiempo (Lima) compartida por fila; aparece en nombre y
 *   en columnas extra (p. ej. DESCRIPCION) para buscar en la grilla aunque la UI
 *   muestre otro campo como principal
 */
export interface MasivoExcelResult {
  tempFilePath: string;
  nombreGenerado: string;
  textoBusqueda: string;
}

/**
 * Genera un sufijo de timestamp único (zona horaria Lima).
 *
 * @returns sufijo con fecha y hora, ej: "5-4-2026_10-15-30 a. m."
 */
export function buildTimestampSuffix(): string {
  return new Date()
    .toLocaleString('es-PE', { timeZone: 'America/Lima' })
    .replace(/[\/:]/g, '-')
    .replace(', ', '_');
}

/**
 * Código de barras numérico: único por fila y por ejecución (evita choque con datos
 * ya cargados en QA cuando solo se sumaba el nº de fila).
 */
function uniquifyBarcodeValue(
  valorActual: string,
  rowNum: number,
  sufijo: string,
): string {
  const trimmed = valorActual.trim();
  if (!/^\d+$/.test(trimmed)) {
    return `${valorActual} ${sufijo} #${rowNum}`;
  }
  try {
    const runSalt = BigInt(Date.now()) * 10_000n + BigInt(randomInt(0, 9_999));
    return String(BigInt(trimmed) + runSalt + BigInt(rowNum));
  } catch {
    return `${valorActual} ${sufijo} #${rowNum}`;
  }
}

function buildUniqueCellValue(
  header: string,
  valorActual: string,
  rowNum: number,
  sufijo: string,
): string {
  if (header.trim().toUpperCase() === 'CODIGO DE BARRAS') {
    return uniquifyBarcodeValue(valorActual, rowNum, sufijo);
  }
  return `${valorActual} ${sufijo} #${rowNum}`;
}

/**
 * Prepara un archivo Excel temporal con el nombre único inyectado.
 *
 * Flujo:
 * 1. Abre el archivo Excel base correspondiente al tipo
 * 2. Busca la hoja correcta por nombre
 * 3. Localiza por encabezado la columna de nombre del tipo y `additionalUniqueHeaders`
 *    (p. ej. DESCRIPCION cuando el ERP valida duplicados en descripción)
 * 4. En cada fila aplica fecha/hora (Lima) + #fila en esas columnas
 * 5. Guarda una copia temporal
 * 6. Devuelve la ruta temporal y el nombre generado
 *
 * @param tipoItem - tipo de item (productos, servicios, etc.)
 * @param descripcionBase - texto base para el nombre (ej: "masivo")
 * @returns ruta del archivo temporal y nombre generado
 */
export async function buildMassiveExcel(
  tipoItem: TipoItemMasivo,
  descripcionBase: string,
): Promise<MasivoExcelResult> {
  const config: MasivoItemConfig = MASIVO_CONFIG[tipoItem];
  const excelPath = resolveExcelPath(tipoItem);

  // 1. Abrir el Excel base
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);

  // 2. Buscar la hoja por nombre
  const sheet = workbook.getWorksheet(config.sheetName);
  if (!sheet) {
    throw new Error(`Hoja "${config.sheetName}" no encontrada en ${config.excelFile}`);
  }

  // 3. Columnas a unicidad: nombre del tipo + opcionales (p. ej. DESCRIPCION en insumos)
  const extra = config.additionalUniqueHeaders ?? [];
  const headersToUnique = [...new Set([config.nombreHeader, ...extra])];

  const headerRow = sheet.getRow(1);
  const columnIndexByHeader = new Map<string, number>();

  for (const header of headersToUnique) {
    let colIdx: number | null = null;
    const want = header.trim().toUpperCase();
    headerRow.eachCell((cell, colNumber) => {
      const cellValue = String(cell.value ?? '').trim().toUpperCase();
      if (cellValue === want) {
        colIdx = colNumber;
      }
    });
    if (colIdx === null) {
      throw new Error(
        `Columna "${header}" no encontrada en hoja "${config.sheetName}" del archivo ${config.excelFile}`,
      );
    }
    columnIndexByHeader.set(header, colIdx);
  }

  // 4. Por cada fila: mismo sufijo en todas las columnas configuradas (evita duplicados ERP)
  const sufijo = buildTimestampSuffix();
  let nombreGenerado = '';
  const lastRow = sheet.lastRow?.number ?? config.dataRow;

  for (let rowNum = config.dataRow; rowNum <= lastRow; rowNum++) {
    const row = sheet.getRow(rowNum);

    for (const header of headersToUnique) {
      const colIdx = columnIndexByHeader.get(header)!;
      const celda = row.getCell(colIdx);
      const valorActual = String(celda.value ?? '').trim();
      if (!valorActual) continue;

      const nuevoNombre = buildUniqueCellValue(header, valorActual, rowNum, sufijo);
      celda.value = nuevoNombre;

      if (header === config.nombreHeader && !nombreGenerado) {
        nombreGenerado = nuevoNombre;
      }
    }

    row.commit();
  }

  // Fallback si no se encontró ningún dato
  if (!nombreGenerado) {
    nombreGenerado = `${descripcionBase} ${sufijo}`;
  }

  // 5. Guardar copia temporal
  const tempDir = path.join(os.tmpdir(), 'erp2-masivos');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const timestamp = Date.now();
  const tempFileName = `${tipoItem}_${timestamp}_${config.excelFile}`;
  const tempFilePath = path.join(tempDir, tempFileName);
  await workbook.xlsx.writeFile(tempFilePath);

  return { tempFilePath, nombreGenerado, textoBusqueda: sufijo };
}

/**
 * Elimina un archivo temporal después de usarlo.
 * No lanza error si el archivo no existe.
 */
export function cleanupTempFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Ignorar errores de limpieza
  }
}
