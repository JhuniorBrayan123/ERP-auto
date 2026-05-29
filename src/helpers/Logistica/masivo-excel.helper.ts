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

export interface MasivoExcelResult {
  tempFilePath: string;
  nombreGenerado: string;
  textoBusqueda: string;
}

export function buildTimestampSuffix(): string {
  return new Date()
    .toLocaleString('es-PE', { timeZone: 'America/Lima' })
    .replace(/[\/:]/g, '-')
    .replace(', ', '_')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

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

export async function buildMassiveExcel(
  tipoItem: TipoItemMasivo,
  descripcionBase: string,
): Promise<MasivoExcelResult> {
  const config: MasivoItemConfig = MASIVO_CONFIG[tipoItem];
  const excelPath = resolveExcelPath(tipoItem);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);

  const sheet = workbook.getWorksheet(config.sheetName);
  if (!sheet) {
    throw new Error(`Hoja "${config.sheetName}" no encontrada en ${config.excelFile}`);
  }

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

  if (!nombreGenerado) {
    nombreGenerado = `${descripcionBase} ${sufijo}`;
  }

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

export function cleanupTempFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    
  }
}
