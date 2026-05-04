/**
 * Datos centralizados para tests de PuntoVenta / Emisiones.
 *
 * Contiene constantes de ítems, clientes, tipos de comprobante y series
 * reutilizables por todos los specs del módulo PuntoVenta.
 *
 * REGLA: no hardcodear estos valores directamente en los specs.
 */
import type { DatosCliente, ItemVenta, TipoComprobante } from './emision.types';

// ─── Tipos de comprobante ─────────────────────────────────────────────

export const TIPOS_COMPROBANTE: Record<string, TipoComprobante> = {
    BOLETA: 'BOLETA',
    FACTURA: 'FACTURA',
    NOTA_VENTA: 'NOTA DE VENTA',
};

// ─── Clientes de prueba ───────────────────────────────────────────────

export const CLIENTES = {
    CONSUMIDOR_FINAL: {
        tipoDocumento: 'DNI',
        documento: '00000000',
        nombre: 'CLIENTES VARIOS',
    } as DatosCliente,

    PERSONA_DNI: {
        tipoDocumento: 'DNI',
        documento: '76975258',
        nombre: 'JHUNIOR BRAYAN GUTIERREZ',
    } as DatosCliente,

    /** Cliente RUC creado por automatización — usado en facturas */
    EMPRESA_RUC_AUTO: {
        tipoDocumento: 'RUC',
        documento: '20759685854',
        nombre: 'automatizacionerp2 cliente RUC',
        /** Texto completo para locator de selección en UI */
        textoSelector: 'RUCReg. Único de Contribuyentes2075968585499999999automatizacionerp2 cliente',
    } as DatosCliente & { textoSelector: string },

    EMPRESA_RUC: {
        tipoDocumento: 'RUC',
        documento: '20100070970',
        nombre: 'SOCIEDAD EJEMPLO SAC',
    } as DatosCliente,
};

// ─── Ítems de venta pre-existentes en el sistema ──────────────────────

export const ITEMS_PV = {
    /** Producto con control de stock estricto */
    PRODUCTO_SIMPLE: {
        codigo: '111111',
        nombre: 'Item para combos estricto',
        cantidad: 1,
    } as ItemVenta,

    /** Producto gravado con control de stock flexible */
    PRODUCTO_GRAVADO: {
        codigo: '121212',
        nombre: 'item para combos gravado',
        cantidad: 1,
    } as ItemVenta,

    /** Producto gravado SIN control de stock */
    ITEM_GRAVADO_SIN_CONTROL: {
        codigo: '151515',
        nombre: 'item gravado sin control',
        cantidad: 1,
    } as ItemVenta,

    /** Producto con equivalencias (X2, X6) */
    ITEM_EQUIVALENTE: {
        codigo: '202020',
        nombre: 'item equivalente flexible',
        cantidad: 1,
    } as ItemVenta,

    /** Producto afecto a ISC */
    ITEM_ISC: {
        codigo: '112211',
        nombre: 'Producto con ISC fijo 27-4-',
        cantidad: 1,
    } as ItemVenta,

    /** Producto afecto a ICBPER */
    ITEM_ICBPER: {
        codigo: '221122',
        nombre: 'Producto con ICBPER 27-4-',
        cantidad: 1,
    } as ItemVenta,

    /** Receta con insumos estrictos */
    RECETA_INSUMOS: {
        codigo: '',
        nombre: 'Receta insumos estrictos 27-4',
        cantidad: 1,
    } as ItemVenta,

    /** Lista de ítems flexibles */
    LISTA_ITEMS: {
        codigo: '443444',
        nombre: 'Lista items flexibles 27-4-',
        cantidad: 1,
    } as ItemVenta,

    PRODUCTO_SIN_STOCK: {
        codigo: '111222',
        nombre: 'Item sin stock estricto',
        cantidad: 1,
    } as ItemVenta,
};

// ─── Series por tipo de comprobante ───────────────────────────────────

export const SERIES = {
    BOLETA: 'B001',
    FACTURA: 'F001',
    NOTA_VENTA: 'NV01',
};

// ─── Almacenes para validación cruzada con Logística ──────────────────

export const ALMACENES_PV = {
    VENTAS: 'ALMACÉN DE VENTAS',
    AUTO: 'ALMACEN-AUTO',
};

// ─── Cajas de venta ───────────────────────────────────────────────────

export const CAJAS = {
    /** Caja principal de automatización — mapeada al ID real del sistema */
    AUTO: {
        id: 16675,
        nombre: 'caja-auto',
        codigo: 'a14ec47a-2',
    },
    VENTA: {
        id: 16673,
        nombre: 'Caja de venta',
        codigo: 'da192a84-b',
    },
};

// ─── Sucursal ─────────────────────────────────────────────────────────

export const SUCURSAL = {
    id: 27747,
    nombre: 'SUCURSAL VENTAS',
};

// ─── IDs de tipo de comprobante (del sistema) ─────────────────────────

export const TIPO_COMPROBANTE_IDS = {
    FACTURA: 1003,
    BOLETA: 1004,
    NOTA_CREDITO: 1005,
    NOTA_DEBITO: 1006,
    NOTA_VENTA: 2016,
};

