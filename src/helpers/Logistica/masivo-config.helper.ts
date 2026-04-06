import * as path from 'node:path';

/**
 * Tipos de item disponibles para carga masiva desde Excel.
 */
export type TipoItemMasivo = 'productos' | 'servicios' | 'insumos' | 'combos' | 'recetas' | 'listas';

/**
 * Configuración por tipo de item para el flujo de carga masiva.
 *
 * Cada tipo define:
 * - cardId: ID estable de la card en la UI para seleccionar el tipo
 * - excelFile: nombre del archivo Excel base en src/data/
 * - sheetName: nombre de la hoja principal del Excel
 * - nombreHeader: header exacto de la columna que se edita con nombre único
 * - dataRow: fila donde comienzan los datos (1-indexed)
 */
export interface MasivoItemConfig {
  tipo: TipoItemMasivo;
  cardLabel: string;
  excelFile: string;
  sheetName: string;
  nombreHeader: string;
  dataRow: number;
  /**
   * Otras columnas donde el ERP exige texto único (p. ej. DESCRIPCION en insumos).
   * Reciben el mismo sufijo fecha + #fila que `nombreHeader`.
   */
  additionalUniqueHeaders?: string[];
}

/**
 * Configuración completa de los 6 tipos de item para carga masiva.
 *
 * Nota sobre PRODUCTOS: no tiene columna NOMBRE, se usa DESCRIPCION (col 1)
 * como campo principal para inyectar el nombre único con fecha/hora.
 */
export const MASIVO_CONFIG: Record<TipoItemMasivo, MasivoItemConfig> = {
  productos: {
    tipo: 'productos',
    cardLabel: 'Productos',
    excelFile: 'FORMATO_SUBIDA_PRODUCTOS.xlsx',
    sheetName: 'PRODUCTOS',
    nombreHeader: 'DESCRIPCION',
    dataRow: 2,
  },
  servicios: {
    tipo: 'servicios',
    cardLabel: 'Servicios',
    excelFile: 'FORMATO_SUBIDA_SERVICIOS.xlsx',
    sheetName: 'SERVICIOS',
    nombreHeader: 'NOMBRE',
    dataRow: 2,
    additionalUniqueHeaders: ['DESCRIPCION', 'CODIGO DE BARRAS'],
  },
  insumos: {
    tipo: 'insumos',
    cardLabel: 'Insumos',
    excelFile: 'FORMATO_SUBIDA_INSUMOS.xlsx',
    sheetName: 'INSUMOS',
    nombreHeader: 'NOMBRE',
    dataRow: 2,
    additionalUniqueHeaders: ['DESCRIPCION'],
  },
  combos: {
    tipo: 'combos',
    cardLabel: 'Combos',
    excelFile: 'FORMATO_SUBIDA_COMBOS.xlsx',
    sheetName: 'COMBOS',
    nombreHeader: 'NOMBRE COMBO',
    dataRow: 2,
    additionalUniqueHeaders: ['DESCRIPCION', 'CODIGO DE BARRAS'],
  },
  recetas: {
    tipo: 'recetas',
    cardLabel: 'Recetas',
    excelFile: 'FORMATO_SUBIDA_RECETAS.xlsx',
    sheetName: 'RECETAS',
    nombreHeader: 'NOMBRE RECETA',
    dataRow: 2,
    additionalUniqueHeaders: ['DESCRIPCION'],
  },
  listas: {
    tipo: 'listas',
    cardLabel: 'Lista de productos',
    excelFile: 'FORMATO_SUBIDA_LISTASPRODUCTOS.xlsx',
    sheetName: 'LISTA DE PRODUCTOS',
    nombreHeader: 'NOMBRE LISTA',
    dataRow: 2,
    additionalUniqueHeaders: ['DESCRIPCION'],
  },
};

/** Ruta base a la carpeta de archivos Excel */
export const EXCEL_BASE_DIR = path.resolve(process.cwd(), 'src', 'data');

/** Resuelve la ruta completa del Excel base para un tipo de item */
export function resolveExcelPath(tipo: TipoItemMasivo): string {
  return path.join(EXCEL_BASE_DIR, MASIVO_CONFIG[tipo].excelFile);
}
