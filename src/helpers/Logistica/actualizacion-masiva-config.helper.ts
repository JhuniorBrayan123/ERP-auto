import * as path from 'node:path';
import { EXCEL_BASE_DIR } from './masivo-config.helper';

/**
 * Configuración centralizada: actualización masiva de datos (productos, servicios, insumos).
 * Ajustar `sheetName` si la hoja del Excel en src/data difiere.
 */
export type TipoActualizacionDatos = 'productos' | 'servicios' | 'insumos';

export interface ColumnMappingRule {
  fileHeader: string;
  systemTarget: string;
}

export interface ActualizacionDatosItemConfig {
  tipo: TipoActualizacionDatos;
  cardLabel: string;
  excelFile: string;
  sheetName: string;
  dataRow: number;
  /**
   * Columna del Excel donde se aplica el sufijo de edición (debe ser el campo
   * que el ERP usa para el nombre visible y la bitácora; en insumos/servicios suele ser DESCRIPCION).
   */
  nombreColumnHeader: string;
  /** Columna clave para buscar el ítem en la lista tras el proceso */
  claveColumnHeader: string;
  /** Mapeos obligatorios si el wizard los pide (vacío si el ERP auto-mapea) */
  columnMappings: ColumnMappingRule[];
}

export const ACTUALIZACION_DATOS_CONFIG: Record<
  TipoActualizacionDatos,
  ActualizacionDatosItemConfig
> = {
  productos: {
    tipo: 'productos',
    cardLabel: 'Productos',
    excelFile: 'FORMATO_EDICION_PRODUCTOS_Masivos.xlsx',
    sheetName: 'PRODUCTOS',
    dataRow: 2,
    nombreColumnHeader: 'DESCRIPCION',
    claveColumnHeader: 'CODIGO',
    // En productos, el Excel trae DESCRIPCION pero el ERP valida/usa "Nombre" como principal.
    columnMappings: [{ fileHeader: 'DESCRIPCION', systemTarget: 'NOMBRE' }],
  },
  servicios: {
    tipo: 'servicios',
    cardLabel: 'Servicios',
    excelFile: 'FORMATO_EDICION_SERVICIOS_Masivos.xlsx',
    sheetName: 'SERVICIOS',
    dataRow: 2,
    // En la plantilla de SERVICIOS existe columna NOMBRE y es el texto principal visible.
    nombreColumnHeader: 'NOMBRE',
    claveColumnHeader: 'CODIGO',
    // El ERP a veces deja "DESCRIPCION" auto-seleccionado; forzamos "NOMBRE" para que la edición sea visible.
    columnMappings: [{ fileHeader: 'NOMBRE', systemTarget: 'NOMBRE' }],
  },
  insumos: {
    tipo: 'insumos',
    cardLabel: 'Insumos',
    excelFile: 'FORMATO_EDICION_INSUMOS_Masivos.xlsx',
    sheetName: 'INSUMOS',
    dataRow: 2,
    // En la plantilla de INSUMOS existe columna NOMBRE y es el texto principal visible.
    nombreColumnHeader: 'NOMBRE',
    claveColumnHeader: 'CODIGO',
    // Forzar "NOMBRE" para que el cambio se refleje en el nombre del ítem.
    columnMappings: [{ fileHeader: 'NOMBRE', systemTarget: 'NOMBRE' }],
  },
};

/**
 * Actualización masiva de stock: sin selección de tipo de ítem.
 */
export interface StockMasivoConfig {
  excelFile: string;
  sheetName: string;
  dataRow: number;
  stockColumnHeader: string;
  codigoColumnHeader: string;
  /** Valor numérico para la columna STOCK (el ERP rechaza texto); usar un número menor que 1000. */
  stockValue: number;
}

export const STOCK_MASIVO_CONFIG: StockMasivoConfig = {
  excelFile: 'FORMATO_ACTUALIZACION_STOCK.xlsx',
  sheetName: 'STOCK',
  dataRow: 2,
  stockColumnHeader: 'STOCK',
  codigoColumnHeader: 'CODIGO',
  stockValue: 777,
};

export function resolveActualizacionDatosExcelPath(tipo: TipoActualizacionDatos): string {
  return path.join(EXCEL_BASE_DIR, ACTUALIZACION_DATOS_CONFIG[tipo].excelFile);
}

export function resolveStockExcelPath(): string {
  return path.join(EXCEL_BASE_DIR, STOCK_MASIVO_CONFIG.excelFile);
}

/** Reglas reutilizables si el wizard pide mapear precio estándar manualmente. */
export function reglasMapeoPrecioEstandar(): ColumnMappingRule[] {
  return [
    { fileHeader: 'PRECIO ESTÁNDAR', systemTarget: 'PRECIO ESTANDAR' },
  ];
}
