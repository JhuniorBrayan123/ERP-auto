/**
 * Datos centralizados para tests de Movimientos de Logística.
 *
 * Contiene constantes de ítems, almacenes, motivos y datos de contacto
 * reutilizables por todos los specs del módulo.
 *
 * REGLA: no hardcodear estos valores directamente en los specs.
 */
import type {ComprobanteData, ItemTest, ProveedorData} from './movimiento.types';

// ─── Ítems de test pre-existentes en el sistema ───────────────────────

export const ITEMS_TEST = {
    PRODUCTO_ESTRICTO: {codigo: '111111', nombre: 'Item para combos estricto'} as ItemTest,
    PRODUCTO_GRAVADO: {codigo: '121212', nombre: 'item para combos gravado'} as ItemTest,
    VARIANTE_FLEXIBLE: {codigo: '313131', nombre: 'item con variante flexible'} as ItemTest,
    EQUIVALENTE_FLEX: {codigo: '202020', nombre: 'item equivalente flexible'} as ItemTest,
    EQUIVALENTE_EST: {codigo: '101010', nombre: 'item equivalente estricto'} as ItemTest,
    INSUMO_FLEXIBLE: {codigo: '666444', nombre: 'nuevo insumo flexible'} as ItemTest,
    INSUMO_TEST1: {codigo: '464646', nombre: 'Nuevo insumo test1'} as ItemTest,
    VARIANTE_ESTRICTO: {codigo: '131313', nombre: 'item variante estricto gravado'} as ItemTest,
    SIN_STOCK: {codigo: '111222', nombre: 'Item sin stock estricto'} as ItemTest,
    MASIVO_PROD: {codigo: 'EDPROD00', nombre: 'Tippy'} as ItemTest,
    MASIVO_INSUMO: {codigo: 'EDINS002', nombre: ''} as ItemTest,

};

// ─── Variantes ────────────────────────────────────────────────────────

export const VARIANTES = {
    V1_FLEXIBLE: {
        nombre: 'Variante 1 flexible',
        codigo: '313131-V001',
    },
    V2_FLEXIBLE: {
        nombre: 'Variante 2 flexible',
        codigo: '313131-V002',
    },
    V3_FLEXIBLE: {
        nombre: 'Variante 3 flexible',
        codigo: '313131-V003',
    },
    V3_ESTRICTO: {
        nombre: 'Variante 3 estricto',
        codigo: '131313-V003',
    },
    EQUIVALENTE_X2: 'Equivalente X2',
};


// ─── Almacenes ────────────────────────────────────────────────────────

export const ALMACENES = {
    AUTO: 'ALMACEN-AUTO',
    VENTAS: 'ALMACÉN DE VENTAS',
};

// ─── Motivos ──────────────────────────────────────────────────────────

export const MOTIVOS_INGRESO = {
    ABASTECIMIENTO: 'INGRESO POR ABASTECIMIENTO',
    COMPRAS: 'COMPRAS',
    TRASLADO: 'INGRESO POR TRASLADO',
    ALMACEN: 'INGRESO A ALMACÉN',
};

export const MOTIVOS_SALIDA = {
    VENTA: 'SALIDA POR VENTA',
    INSUMOS: 'SALIDA DE INSUMOS',
    ABASTECIMIENTO: 'SALIDA POR ABASTECIMIENTO',
};

export const MOTIVOS_AJUSTE = {
    ACTUALIZACION: 'AJUSTE POR ACTUALIZACIÓN DE',
    VENCIMIENTO: 'AJUSTE VENCIMIENTO',
};

export const MOTIVOS_TRASLADO = {
    INTERNO: 'TRASLADO INTERNO',
    OTROS: 'TRASLADO OTROS',
};

// ─── Datos de contacto para acciones post-registro ────────────────────

export const DATOS_CONTACTO = {
    TELEFONO: '963078103',
    EMAIL: 'srqapruebaserp2@gmail.com',
};

// ─── Datos de proveedor para datos opcionales ─────────────────────────

export const PROVEEDOR_TEST: ProveedorData = {
    tipoDocumento: 'DNI',
    numDocumento: '76975258',
    direccion: 'av-ejemplo-auto',
    telefono: '99999999',
    email: 'ejemploauto@gmail.com',
};

export const PROVEEDOR_EXISTENTE = {
    numDocumento: '76975258',
    nombre: 'JHUNIOR BRAYAN GUTIERREZ',
};

// ─── Datos de comprobante ─────────────────────────────────────────────

export const COMPROBANTE_TEST: ComprobanteData = {
    tipo: 'FACTURA',
    serie: 'F001',
    numero: '1234',
    cuc: '10101010101',
};

// ─── Archivos Excel para movimientos masivos ──────────────────────────

export const EXCEL_MASIVOS = {
    INGRESOS: 'FORMATO_SUBIDA_MOVIMIENTOS_INGRESOS.xlsx',
    INGRESOS_INSUMOS: 'FORMATO_SUBIDA_MOVIMIENTOS_INGRESOS_INSUMOS.xlsx',
};

// ─── Patrones de código de movimiento ─────────────────────────────────

export const PATRON_CODIGO = {
    INGRESO: /M001-I-/,
    SALIDA: /M001-S-/,
    AJUSTE: /M001-A-/,
    TRASLADO: /M001-T-/,
};
