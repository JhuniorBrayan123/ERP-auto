import * as path from 'node:path';
import { EXCEL_BASE_DIR } from './masivo-config.helper';

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
  
  nombreColumnHeader: string;
  
  claveColumnHeader: string;
  
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
    nombreColumnHeader: 'NOMBRE',
    claveColumnHeader: 'CODIGO',
    
    columnMappings: [{ fileHeader: 'NOMBRE', systemTarget: 'NOMBRE' }],
  },
  servicios: {
    tipo: 'servicios',
    cardLabel: 'Servicios',
    excelFile: 'FORMATO_EDICION_SERVICIOS_Masivos.xlsx',
    sheetName: 'SERVICIOS',
    dataRow: 2,
    
    nombreColumnHeader: 'NOMBRE',
    claveColumnHeader: 'CODIGO',
    
    columnMappings: [{ fileHeader: 'NOMBRE', systemTarget: 'NOMBRE' }],
  },
  insumos: {
    tipo: 'insumos',
    cardLabel: 'Insumos',
    excelFile: 'FORMATO_EDICION_INSUMOS_Masivos.xlsx',
    sheetName: 'INSUMOS',
    dataRow: 2,
    
    nombreColumnHeader: 'NOMBRE',
    claveColumnHeader: 'CODIGO',
    
    columnMappings: [{ fileHeader: 'NOMBRE', systemTarget: 'NOMBRE' }],
  },
};

export interface StockMasivoConfig {
  excelFile: string;
  sheetName: string;
  dataRow: number;
  stockColumnHeader: string;
  codigoColumnHeader: string;
  
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

export function reglasMapeoPrecioEstandar(): ColumnMappingRule[] {
  return [
    { fileHeader: 'PRECIO ESTÁNDAR', systemTarget: 'PRECIO ESTANDAR' },
  ];
}
