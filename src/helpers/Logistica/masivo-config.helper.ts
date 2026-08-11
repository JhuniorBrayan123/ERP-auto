import * as path from 'node:path';

export type TipoItemMasivo = 'productos' | 'servicios' | 'insumos' | 'combos' | 'recetas' | 'listas';

export interface MasivoItemConfig {
  tipo: TipoItemMasivo;
  cardLabel: string;
  excelFile: string;
  sheetName: string;
  nombreHeader: string;
  dataRow: number;
  
  additionalUniqueHeaders?: string[];
}

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
    cardLabel: 'Listas de productos',
    excelFile: 'FORMATO_SUBIDA_LISTASPRODUCTOS.xlsx',
    sheetName: 'LISTA DE PRODUCTOS',
    nombreHeader: 'NOMBRE LISTA',
    dataRow: 2,
    additionalUniqueHeaders: ['DESCRIPCION'],
  },
};

export const EXCEL_BASE_DIR = path.resolve(process.cwd(), 'src', 'data');

export function resolveExcelPath(tipo: TipoItemMasivo): string {
  return path.join(EXCEL_BASE_DIR, MASIVO_CONFIG[tipo].excelFile);
}
