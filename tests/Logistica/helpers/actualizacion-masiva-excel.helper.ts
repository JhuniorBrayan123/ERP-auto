import * as path from 'node:path';
import * as fs from 'node:fs';
import * as os from 'node:os';
import ExcelJS from 'exceljs';
import { buildTimestampSuffix } from './masivo-excel.helper';
import {
  type TipoActualizacionDatos,
  ACTUALIZACION_DATOS_CONFIG,
  STOCK_MASIVO_CONFIG,
  resolveActualizacionDatosExcelPath,
  resolveStockExcelPath,
} from './actualizacion-masiva-config.helper';

export interface ActualizacionDatosExcelResult {
  tempFilePath: string;
  /** Sufijo de ejecución (Lima); útil para buscar en grilla */
  textoBusqueda: string;
  /** Primer código de la primera fila de datos (clave estable) */
  primerCodigo: string;
  /** Nombre/descripción editada de la primera fila (con sufijo) */
  primerNombreEditado: string;
}

export interface StockMasivoExcelResult {
  tempFilePath: string;
  primerCodigo: string;
  stockValue: number;
}

/**
 * Quita sufijos de ejecuciones anteriores para no apilar marcas al re-leer celdas ya tocadas.
 */
export function stripPriorAutomationSuffixes(valor: string): string {
  let s = valor.trim();
  for (let i = 0; i < 8; i++) {
    const next = s
      .replace(/\s+#\d+$/, '')
      .replace(/\s+\d{1,2}-\d{1,2}-\d{4}_[^\n]+$/i, '')
      .replace(/\s+edición\s+#\d+$/i, '');
    if (next === s) break;
    s = next.trim();
  }
  return s;
}

function resolveSheet(workbook: ExcelJS.Workbook, sheetName: string): ExcelJS.Worksheet {
  const sheet = workbook.getWorksheet(sheetName);
  if (sheet) return sheet;
  const first = workbook.worksheets[0];
  if (!first) {
    throw new Error('El libro no tiene hojas');
  }
  return first;
}

function findColumnIndex(headerRow: ExcelJS.Row, header: string): number {
  const want = header.trim().toUpperCase();
  let idx: number | null = null;
  headerRow.eachCell((cell, colNumber) => {
    if (String(cell.value ?? '').trim().toUpperCase() === want) {
      idx = colNumber;
    }
  });
  if (idx === null) {
    throw new Error(`Columna "${header}" no encontrada en la fila 1`);
  }
  return idx;
}

/**
 * Genera Excel temporal desde la plantilla en src/data: solo nombres con sufijo de edición.
 * Siempre lee el archivo original de `src/data` (no el temporal).
 */
export async function buildActualizacionDatosExcel(
  tipo: TipoActualizacionDatos,
): Promise<ActualizacionDatosExcelResult> {
  const config = ACTUALIZACION_DATOS_CONFIG[tipo];
  const srcPath = resolveActualizacionDatosExcelPath(tipo);
  if (!fs.existsSync(srcPath)) {
    throw new Error(
      `Falta el Excel base en ${srcPath}. Colócalo en src/data con el nombre configurado.`,
    );
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(srcPath);
  const sheet = resolveSheet(workbook, config.sheetName);
  const headerRow = sheet.getRow(1);
  const nombreCol = findColumnIndex(headerRow, config.nombreColumnHeader);
  const claveCol = findColumnIndex(headerRow, config.claveColumnHeader);

  const sufijo = buildTimestampSuffix();
  const lastRow = sheet.lastRow?.number ?? config.dataRow;

  let primerCodigo = '';
  let primerNombreEditado = '';

  for (let rowNum = config.dataRow; rowNum <= lastRow; rowNum++) {
    const row = sheet.getRow(rowNum);
    const celdaNombre = row.getCell(nombreCol);
    const raw = String(celdaNombre.value ?? '').trim();
    if (!raw) continue;

    const base = stripPriorAutomationSuffixes(raw);
    const editado = `${base} ${sufijo} edición #${rowNum}`;
    celdaNombre.value = editado;
    row.commit();

    const cod = String(row.getCell(claveCol).value ?? '').trim();
    if (!primerCodigo && cod) {
      primerCodigo = cod;
      primerNombreEditado = editado;
    }
  }

  const tempDir = path.join(os.tmpdir(), 'erp2-actualizacion-masiva');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const tempFilePath = path.join(
    tempDir,
    `actualizacion_${tipo}_${Date.now()}_${config.excelFile}`,
  );
  await workbook.xlsx.writeFile(tempFilePath);

  return {
    tempFilePath,
    textoBusqueda: sufijo,
    primerCodigo,
    primerNombreEditado,
  };
}

/**
 * Excel de stock: escribe un número en la columna STOCK desde la plantilla original.
 */
export async function buildStockMasivoExcel(): Promise<StockMasivoExcelResult> {
  const cfg = STOCK_MASIVO_CONFIG;
  const srcPath = resolveStockExcelPath();
  if (!fs.existsSync(srcPath)) {
    throw new Error(`Falta el Excel base en ${srcPath}`);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(srcPath);
  const sheet = resolveSheet(workbook, cfg.sheetName);
  const headerRow = sheet.getRow(1);
  const stockCol = findColumnIndex(headerRow, cfg.stockColumnHeader);
  const codigoCol = findColumnIndex(headerRow, cfg.codigoColumnHeader);

  const lastRow = sheet.lastRow?.number ?? cfg.dataRow;
  let primerCodigo = '';

  for (let rowNum = cfg.dataRow; rowNum <= lastRow; rowNum++) {
    const row = sheet.getRow(rowNum);
    const cod = String(row.getCell(codigoCol).value ?? '').trim();
    if (!cod) continue;
    row.getCell(stockCol).value = cfg.stockValue;
    row.commit();
    if (!primerCodigo) primerCodigo = cod;
  }

  const tempDir = path.join(os.tmpdir(), 'erp2-actualizacion-masiva');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const tempFilePath = path.join(
    tempDir,
    `stock_${Date.now()}_${cfg.excelFile}`,
  );
  await workbook.xlsx.writeFile(tempFilePath);

  return {
    tempFilePath,
    primerCodigo,
    stockValue: cfg.stockValue,
  };
}

export function cleanupTempFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    /* ignore */
  }
}
