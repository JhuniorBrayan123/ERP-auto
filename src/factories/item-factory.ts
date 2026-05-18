/**
 * Fábrica de ítems dinámicos para pruebas.
 *
 * Genera códigos únicos con un RUN_ID (timestamp corto) para que cada ejecución
 * cree sus propios ítems y no sobrecargue el Kardex con datos estáticos.
 *
 * Flujo:
 *   1. Setup genera RUN_ID y crea ítems con códigos dinámicos
 *   2. Guarda el mapa de códigos en playwright/.auth/dynamic-items.json
 *   3. Helpers leen el mapa y sobrescriben los códigos en memoria
 *   4. Tests usan los códigos dinámicos transparentemente
 */

import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'fs';
import {resolve} from 'path';
import type {InsumoReceta, ProductoListaItem, ISCConfig, ComponenteCombo} from '../types/item-data.types';

// ─── Tipos ─────────────────────────────────────────────────────────────

export interface ItemTemplate {
  /** Nombre original del item (clave para lookup) */
  key: string;
  /** Código base original (ej. "111111") */
  codigoBase: string;
  /** Nombre del item en el ERP */
  nombre: string;
  /** Tipo de item */
  tipo: 'producto' | 'receta' | 'lista' | 'combo';
  /** Fase de creación (solo se crean templates con fase > 0). Controla orden de dependencias. */
  fase?: number;
  /** Si es true, se le añadirá el RUN_ID al código base. Si es false o no se especifica, se mantendrá estático. */
  esDinamico?: boolean;
  /** Configuración específica del item */
  config: ItemConfig;
}

export interface ItemConfig {
  precioVenta: string;
  precioCompra: string;
  controlStock: 'estricto' | 'flexible';
  almacen?: string;
  cantidadStock?: string;
  isc?: ISCConfig;
  icbper?: boolean;
  insumos?: InsumoReceta[];
  productosLista?: ProductoListaItem[];
  componentesCombo?: ComponenteCombo[];
  categoria?: string;
  subcategoria?: string;
  marca?: string;
  /** Configuración de variantes (atributos + variantes con nombres y stock) */
  variantes?: {
    atributos: Array<{ titulo: string; opciones: string[] }>;
    items: Array<{
      nombre: string;
      stock?: { cantidadMaxima: string; cantidadMinima: string };
    }>;
  };
  /** Configuración de equivalencias */
  equivalencias?: Array<{
    nombre: string;
    factor: number;
    tipoAfectacion: string;
    precioVenta: string;
    precioCompra: string;
  }>;
}

export interface DynamicItemsMap {
  RUN_ID: string;
  [key: string]: string;
}

// ─── Ruta del archivo de mapeo ─────────────────────────────────────────

const AUTH_DIR = resolve(process.cwd(), 'playwright', '.auth');
const MAPPING_FILE = resolve(AUTH_DIR, 'dynamic-items.json');

// ─── Templates de ítems base ───────────────────────────────────────────

export const ITEM_TEMPLATES: ItemTemplate[] = [
  {
    key: 'PRODUCTO_SIMPLE',
    codigoBase: '111111',
    nombre: 'Item para combos estricto',
    tipo: 'producto',
    fase: 1,
    esDinamico: true,
    config: {
      precioVenta: '8.69',
      precioCompra: '3.5',
      controlStock: 'estricto',
      cantidadStock: '100',
      categoria: 'REGRESION',
      subcategoria: 'AUTO-TEST',
      marca: 'AUTOMATIZADO',
    },
  },
  {
    key: 'PRODUCTO_GRAVADO',
    codigoBase: '121212',
    nombre: 'item para combos gravado',
    tipo: 'producto',
    fase: 1,
    esDinamico: true,
    config: {
      precioVenta: '10.25',
      precioCompra: '3.5',
      controlStock: 'flexible',
      categoria: 'REGRESION',
      subcategoria: 'AUTO-TEST',
      marca: 'AUTOMATIZADO',
    },
  },
  {
    key: 'ITEM_GRAVADO_SIN_CONTROL',
    codigoBase: '151515',
    nombre: 'item gravado sin control',
    tipo: 'producto',
    config: {
      precioVenta: '8.69',
      precioCompra: '3.5',
      controlStock: 'flexible',
      categoria: 'REGRESION',
      subcategoria: 'AUTO-TEST',
      marca: 'AUTOMATIZADO',
    },
  },
  {
    key: 'ITEM_EQUIVALENTE',
    codigoBase: '202020',
    nombre: 'item equivalente flexible',
    tipo: 'producto',
    fase: 2,
    esDinamico: true,
    config: {
      precioVenta: '10.44',
      precioCompra: '3.5',
      controlStock: 'flexible',
      categoria: 'REGRESION',
      subcategoria: 'AUTO-TEST',
      marca: 'AUTOMATIZADO',
      equivalencias: [
        { nombre: 'Equivalente X2', factor: 2, tipoAfectacion: 'Gravado (Paga IGV 18%)', precioVenta: '20.11', precioCompra: '5.4552' },
        { nombre: 'Equivalencia X6', factor: 6, tipoAfectacion: 'Gravado (Paga IGV 18%)', precioVenta: '60.454', precioCompra: '20.5254' },
      ],
    },
  },
  {
    key: 'ITEM_EQUIVALENTE_ESTRICTO',
    codigoBase: '101010',
    nombre: 'item equivalente estricto gravado',
    tipo: 'producto',
    fase: 2,
    esDinamico: true,
    config: {
      precioVenta: '10.44',
      precioCompra: '3.5',
      controlStock: 'estricto',
      cantidadStock: '100',
      categoria: 'REGRESION',
      subcategoria: 'AUTO-TEST',
      marca: 'AUTOMATIZADO',
      equivalencias: [
        { nombre: 'Equivalente X2', factor: 2, tipoAfectacion: 'Gravado (Paga IGV 18%)', precioVenta: '20.11', precioCompra: '5.4552' },
        { nombre: 'Equivalencia X6', factor: 6, tipoAfectacion: 'Gravado (Paga IGV 18%)', precioVenta: '60.454', precioCompra: '20.5254' },
      ],
    },
  },
  {
    key: 'ITEM_ISC',
    codigoBase: '112211',
    nombre: 'Producto con ISC fijo 27-4-',
    tipo: 'producto',
    fase: 1,
    config: {
      precioVenta: '11.52',
      precioCompra: '3.5',
      controlStock: 'flexible',
      isc: {tipoSistema: 'Aplicación al monto fijo', monto: '1.5'},
      categoria: 'REGRESION',
      subcategoria: 'AUTO-TEST',
      marca: 'AUTOMATIZADO',
    },
  },
  {
    key: 'ITEM_ICBPER',
    codigoBase: '221122',
    nombre: 'Producto con ICBPER 27-4-',
    tipo: 'producto',
    fase: 1,
    config: {
      precioVenta: '10',
      precioCompra: '10',
      controlStock: 'flexible',
      icbper: true,
      categoria: 'REGRESION',
      subcategoria: 'AUTO-TEST',
      marca: 'AUTOMATIZADO',
    },
  },
  {
    key: 'PRODUCTO_SIN_STOCK',
    codigoBase: '111222',
    nombre: 'Item sin stock estricto',
    tipo: 'producto',
    config: {
      precioVenta: '8.69',
      precioCompra: '3.5',
      controlStock: 'estricto',
      cantidadStock: '0',
      categoria: 'REGRESION',
      subcategoria: 'AUTO-TEST',
      marca: 'AUTOMATIZADO',
    },
  },
  {
    key: 'ITEM_VARIANTE_FLEXIBLE',
    codigoBase: '313131',
    nombre: 'item con variante flexible',
    tipo: 'producto',
    fase: 2,
    esDinamico: true,
    config: {
      precioVenta: '10.44',
      precioCompra: '3.5',
      controlStock: 'flexible',
      categoria: 'REGRESION',
      subcategoria: 'AUTO-TEST',
      marca: 'AUTOMATIZADO',
      variantes: {
        atributos: [
          { titulo: 'Marca', opciones: ['Acer', 'Hp', 'Apple'] },
          { titulo: 'RAM', opciones: ['32 GB', '24 GB', '16 GB'] },
          { titulo: 'Memoria', opciones: ['500 GB', '250 GB', '128 GB'] },
        ],
        items: [
          { nombre: 'Variante 1 flexible', stock: { cantidadMaxima: '1001', cantidadMinima: '100' } },
          { nombre: 'Variante 2 flexible', stock: { cantidadMaxima: '1001', cantidadMinima: '100' } },
          { nombre: 'Variante 3 flexible', stock: { cantidadMaxima: '100', cantidadMinima: '100' } },
        ],
      },
    },
  },
  {
    key: 'ITEM_VARIANTE_ESTRICTO',
    codigoBase: '131313',
    nombre: 'item variante estricto gravado',
    tipo: 'producto',
    fase: 2,
    esDinamico: true,
    config: {
      precioVenta: '10.44',
      precioCompra: '3.5',
      controlStock: 'estricto',
      categoria: 'REGRESION',
      subcategoria: 'AUTO-TEST',
      marca: 'AUTOMATIZADO',
      variantes: {
        atributos: [
          { titulo: 'Marca', opciones: ['Acer', 'Hp', 'Apple'] },
          { titulo: 'RAM', opciones: ['32 GB', '24 GB', '16 GB'] },
          { titulo: 'Memoria', opciones: ['500 GB', '250 GB', '128 GB'] },
        ],
        items: [
          { nombre: 'Variante 1 estricto', stock: { cantidadMaxima: '1001', cantidadMinima: '100' } },
          { nombre: 'Variante 2 estricto', stock: { cantidadMaxima: '1001', cantidadMinima: '100' } },
          { nombre: 'Variante 3 estricto', stock: { cantidadMaxima: '2', cantidadMinima: '2' } },
        ],
      },
    },
  },
  {
    key: 'RECETA_INSUMOS',
    codigoBase: '332211',
    nombre: 'Receta insumos estrictos 27-4',
    tipo: 'receta',
    fase: 3,
    esDinamico: true,
    config: {
      precioVenta: '50.22',
      precioCompra: '15.45',
      controlStock: 'flexible',
      insumos: [
        {codigoBusqueda: '464646', textoSeleccion: 'Nuevo insumo test1'},
        {codigoBusqueda: '444666', textoSeleccion: 'nuevo insumo con', equivalencia: 'equivalenteX2 insumo'},
      ],
      categoria: 'REGRESION',
      subcategoria: 'AUTO-TEST',
      marca: 'AUTOMATIZADO',
    },
  },
  {
    key: 'LISTA_ITEMS',
    codigoBase: '443444',
    nombre: 'Lista items flexibles 27-4-',
    tipo: 'lista',
    fase: 4,
    esDinamico: true,
    config: {
      precioVenta: '10.25',
      precioCompra: '3.5',
      controlStock: 'flexible',
      productosLista: [
        {codigoBusqueda: 'PRODUCTO_GRAVADO', textoSeleccion: 'item para combos gravado'},
        {codigoBusqueda: 'ITEM_VARIANTE_FLEXIBLE', textoSeleccion: 'item con variante flexible', variante: 'Variante 1 flexible'},
        {codigoBusqueda: 'ITEM_EQUIVALENTE', textoSeleccion: 'item equivalente flexible', equivalencia: 'Equivalente X2'},
        {codigoBusqueda: 'ITEM_SELECTOR_FLEXIBLE', textoSeleccion: 'item selector flexible'},
      ],
    },
  },
  {
    key: 'ITEM_SELECTOR_GRAVADO',
    codigoBase: '454545',
    nombre: 'item selector gravado',
    tipo: 'producto',
    config: {
      precioVenta: '10.25',
      precioCompra: '3.5',
      controlStock: 'estricto',
      cantidadStock: '100',
      categoria: 'REGRESION',
      subcategoria: 'AUTO-TEST',
      marca: 'AUTOMATIZADO',
    },
  },
  {
    key: 'ITEM_SELECTOR_FLEXIBLE',
    codigoBase: '545454',
    nombre: 'item selector flexible',
    tipo: 'producto',
    fase: 1,
    config: {
      precioVenta: '10.25',
      precioCompra: '3.5',
      controlStock: 'flexible',
      categoria: 'REGRESION',
      subcategoria: 'AUTO-TEST',
      marca: 'AUTOMATIZADO',
    },
  },
  {
    key: 'SOLO_EN_AUTO',
    codigoBase: '83838383',
    nombre: 'Item solo almacen-auto X2',
    tipo: 'producto',
    fase: 1,
    config: {
      precioVenta: '10.55',
      precioCompra: '3.5',
      controlStock: 'estricto',
      almacen: 'ALMACEN-AUTO',
      cantidadStock: '1',
      categoria: 'REGRESION',
      subcategoria: 'AUTO-TEST',
      marca: 'AUTOMATIZADO',
    },
  },
  {
    key: 'SOLO_EN_VENTAS',
    codigoBase: '38383838',
    nombre: 'Item solo almacen-venta',
    tipo: 'producto',
    fase: 1,
    config: {
      precioVenta: '10.55',
      precioCompra: '3.5',
      controlStock: 'estricto',
      almacen: 'ALMACÉN DE VENTAS',
      cantidadStock: '1',
      categoria: 'REGRESION',
      subcategoria: 'AUTO-TEST',
      marca: 'AUTOMATIZADO',
    },
  },
  // ─── Templates para bloqueos por stock ────────────────────────────────
  {
    key: 'COMBO_EXONERADO',
    codigoBase: '222222',
    nombre: 'combo hijo exonegaro item',
    tipo: 'combo',
    fase: 3,
    config: {
      precioVenta: '10.25',
      precioCompra: '3.5',
      controlStock: 'flexible',
      componentesCombo: [
        {codigoBusqueda: 'PRODUCTO_SIMPLE', textoSeleccion: 'Item para combos estricto'},
        {codigoBusqueda: 'PRODUCTO_GRAVADO', textoSeleccion: 'item para combos gravado'},
      ],
      categoria: 'REGRESION',
      subcategoria: 'AUTO-TEST',
      marca: 'AUTOMATIZADO',
    },
  },
  {
    key: 'RECETA_SIN_STOCK',
    codigoBase: '112121',
    nombre: 'Receta con item sin Sotck',
    tipo: 'receta',
    fase: 3,
    config: {
      precioVenta: '10.25',
      precioCompra: '3.5',
      controlStock: 'flexible',
      insumos: [
        {codigoBusqueda: 'PRODUCTO_SIN_STOCK', textoSeleccion: 'Item sin stock estricto'},
      ],
      categoria: 'REGRESION',
      subcategoria: 'AUTO-TEST',
      marca: 'AUTOMATIZADO',
    },
  },
  {
    key: 'COMBO_STOCK_BAJO_ITEM',
    codigoBase: '636363',
    nombre: 'Combo items con uno sin stock',
    tipo: 'combo',
    fase: 3,
    config: {
      precioVenta: '10.25',
      precioCompra: '3.5',
      controlStock: 'flexible',
      componentesCombo: [
        {codigoBusqueda: 'PRODUCTO_SIN_STOCK', textoSeleccion: 'Item sin stock estricto'},
        {codigoBusqueda: 'ITEM_SELECTOR_FLEXIBLE', textoSeleccion: 'item selector flexible'},
        {codigoBusqueda: 'ITEM_EQUIVALENTE', textoSeleccion: 'item equivalente flexible', equivalencia: 'Equivalente X2'},
        {codigoBusqueda: 'ITEM_VARIANTE_FLEXIBLE', textoSeleccion: 'item con variante flexible', variante: 'Variante 1 flexible'},
        {codigoBusqueda: 'PRODUCTO_GRAVADO', textoSeleccion: 'item para combos gravado'},
      ],
      categoria: 'REGRESION',
      subcategoria: 'AUTO-TEST',
      marca: 'AUTOMATIZADO',
    },
  },
  {
    key: 'LISTA_SIN_STOCK',
    codigoBase: '434344',
    nombre: 'Lista con un item sin stock',
    tipo: 'lista',
    fase: 4,
    config: {
      precioVenta: '10.25',
      precioCompra: '3.5',
      controlStock: 'flexible',
      productosLista: [
        {codigoBusqueda: 'PRODUCTO_SIN_STOCK', textoSeleccion: 'Item sin stock estricto'},
        {codigoBusqueda: 'ITEM_SELECTOR_FLEXIBLE', textoSeleccion: 'item selector flexible'},
        {codigoBusqueda: 'ITEM_EQUIVALENTE', textoSeleccion: 'item equivalente flexible', equivalencia: 'Equivalente X2'},
        {codigoBusqueda: 'ITEM_VARIANTE_FLEXIBLE', textoSeleccion: 'item con variante flexible', variante: 'Variante 1 flexible'},
        {codigoBusqueda: 'PRODUCTO_GRAVADO', textoSeleccion: 'item para combos gravado'},
      ],
    },
  },
];

// ─── Funciones de la fábrica ───────────────────────────────────────────

/**
 * Genera un RUN_ID único para esta ejecución (últimos 5 dígitos del timestamp).
 */
export function generarRunId(): string {
  return String(Date.now()).slice(-5);
}

/**
 * Genera un código dinámico a partir de un código base y un RUN_ID.
 * Ej: "111111" + "65432" → "111111-65432"
 */
export function generarCodigoDinamico(codigoBase: string, runId: string): string {
  return `${codigoBase}-${runId}`;
}

/**
 * Crea el mapa completo de códigos dinámicos para todos los templates.
 */
export function generarMapaCodigos(runId: string): DynamicItemsMap {
  const mapa: DynamicItemsMap = {RUN_ID: runId};
  for (const template of ITEM_TEMPLATES) {
    if (template.esDinamico) {
      mapa[template.key] = generarCodigoDinamico(template.codigoBase, runId);
    } else {
      mapa[template.key] = template.codigoBase; // Código estático
    }
  }
  return mapa;
}

/**
 * Guarda el mapa de códigos en playwright/.auth/dynamic-items.json.
 */
export function guardarMapaCodigos(mapa: DynamicItemsMap): void {
  if (!existsSync(AUTH_DIR)) {
    mkdirSync(AUTH_DIR, {recursive: true});
  }
  writeFileSync(MAPPING_FILE, JSON.stringify(mapa, null, 2), 'utf-8');
  console.log(`[ItemFactory] Mapa guardado en ${MAPPING_FILE}`);
  console.log(`[ItemFactory] RUN_ID: ${mapa.RUN_ID}`);
  console.log(`[ItemFactory] Items: ${Object.keys(mapa).length - 1} definidos`);
}

/**
 * Lee el mapa de códigos desde playwright/.auth/dynamic-items.json.
 * Retorna null si no existe.
 */
export function cargarMapaCodigos(): DynamicItemsMap | null {
  if (!existsSync(MAPPING_FILE)) {
    return null;
  }
  try {
    const contenido = readFileSync(MAPPING_FILE, 'utf-8');
    return JSON.parse(contenido) as DynamicItemsMap;
  } catch {
    return null;
  }
}

/**
 * Retorna el RUN_ID de la ejecución anterior (si existe mapa previo).
 */
export function cargarRunIdAnterior(): string | null {
  const mapa = cargarMapaCodigos();
  return mapa?.RUN_ID ?? null;
}

/**
 * Obtiene el código dinámico para una clave dada.
 * Si hay mapa cargado, retorna el código dinámico.
 * Si no, retorna el código base original (fallback).
 */
export function getCodigo(key: string): string {
  const mapa = cargarMapaCodigos();
  if (mapa && mapa[key]) {
    return mapa[key];
  }
  // Fallback: buscar en templates
  const template = ITEM_TEMPLATES.find(t => t.key === key);
  return template?.codigoBase ?? key;
}

/**
 * Busca un template por su clave.
 */
export function getTemplate(key: string): ItemTemplate | undefined {
  return ITEM_TEMPLATES.find(t => t.key === key);
}
