/**
 * Datos centralizados para tests de PuntoVenta / Emisiones.
 *
 * Contiene constantes de ítems, clientes, tipos de comprobante y series
 * reutilizables por todos los specs del módulo PuntoVenta.
 *
 * REGLA: no hardcodear estos valores directamente en los specs.
 */
import type {DatosCliente, ItemVenta, TipoComprobante} from "./emision.types";

// ─── Tipos de comprobante ─────────────────────────────────────────────

export const TIPOS_COMPROBANTE: Record<string, TipoComprobante> = {
    BOLETA: "BOLETA",
    FACTURA: "FACTURA",
    NOTA_VENTA: "NOTA DE VENTA",
    COTIZACION: "COTIZACIÓN",
    PEDIDO: "PEDIDO",
};

// ─── Clientes de prueba ───────────────────────────────────────────────

export const CLIENTES = {
    CONSUMIDOR_FINAL: {
        tipoDocumento: "DNI",
        documento: "00000000",
        nombre: "CLIENTES VARIOS",
    } as DatosCliente,

    PERSONA_DNI: {
        tipoDocumento: "DNI",
        documento: "76975258",
        nombre: "JHUNIOR BRAYAN GUTIERREZ",
    } as DatosCliente,

    PERSONA_DNI_2: {
        tipoDocumento: 'DNI',
        documento: '76958585',
        nombre: 'MARCELO EDWIN SOLANO GARAY',
        textoSelector: 'DNIDoc. Nacional de Identidad7695858599999999MARCELO EDWIN SOLANO GARAYArequipa',
    } as DatosCliente & { textoSelector: string },

    CLIENTE_SIN_DOC: {
        tipoDocumento: '',
        documento: '',
        nombre: 'Automatizador qa',
        direccion: 'Arequipa',
    } as DatosCliente & { direccion: string },

    /** Cliente RUC creado por automatización — usado en facturas */
    EMPRESA_RUC_AUTO: {
        tipoDocumento: "RUC",
        documento: "20759685854",
        nombre: "automatizacionerp2 cliente RUC",
        /** Texto completo para locator de selección en UI */
        textoSelector:
            "RUCReg. Único de Contribuyentes2075968585499999999automatizacionerp2 cliente",
    } as DatosCliente & { textoSelector: string },

    PERSONA_AUTO: {
        tipoDocumento: "DNI",
        documento: "76975258",
        nombre: "Vendedor auto",
    } as DatosCliente,

    EMPRESA_RUC: {
        tipoDocumento: "RUC",
        documento: "20100070970",
        nombre: "SOCIEDAD EJEMPLO SAC",
    } as DatosCliente,
};

// ─── Ítems de venta pre-existentes en el sistema ──────────────────────
export const ITEMS_POR_ALMACEN = {
    SOLO_EN_AUTO: {
        codigo: "83838383",
        nombre: "Item solo almacen-auto X2",
        cantidad: 1,
    } as ItemVenta,
    SOLO_EN_VENTAS: {
        codigo: "38383838",
        nombre: "Item solo almacen-venta",
        cantidad: 1,
    } as ItemVenta,
}
export const ITEMS_PV = {
    /** Producto con control de stock estricto */
    PRODUCTO_SIMPLE: {
        codigo: "111111",
        nombre: "Item para combos estricto",
        cantidad: 1,
    } as ItemVenta,

    /** Producto gravado con control de stock flexible */
    PRODUCTO_GRAVADO: {
        codigo: "121212",
        nombre: "item para combos gravado",
        cantidad: 1,
    } as ItemVenta,

    /** Producto gravado SIN control de stock */
    ITEM_GRAVADO_SIN_CONTROL: {
        codigo: "151515",
        nombre: "item gravado sin control",
        cantidad: 1,
    } as ItemVenta,

    /** Producto con equivalencias (X2, X6) */
    ITEM_EQUIVALENTE: {
        codigo: "202020",
        nombre: "item equivalente flexible",
        cantidad: 1,
    } as ItemVenta,

    /** Producto afecto a ISC */
    ITEM_ISC: {
        codigo: "112211",
        nombre: "Producto con ISC fijo 27-4-",
        cantidad: 1,
    } as ItemVenta,

    /** Producto afecto a ICBPER */
    ITEM_ICBPER: {
        codigo: "221122",
        nombre: "Producto con ICBPER 27-4-",
        cantidad: 1,
    } as ItemVenta,

    /** Receta con insumos estrictos */
    RECETA_INSUMOS: {
        codigo: "332211",
        nombre: "Receta insumos estrictos 27-4",
        cantidad: 1,
    } as ItemVenta,

    /** Lista de ítems flexibles */
    LISTA_ITEMS: {
        codigo: "443444",
        nombre: "Lista items flexibles 27-4-",
        cantidad: 1,
    } as ItemVenta,

    PRODUCTO_SIN_STOCK: {
        codigo: "111222",
        nombre: "Item sin stock estricto",
        cantidad: 1,
    } as ItemVenta,

    /** Combo con ítem hijo exonerado */
    COMBO_EXONERADO: {
        codigo: "222222",
        nombre: "combo hijo exonegaro item",
        cantidad: 1,
    } as ItemVenta,
    /** Combo con ítem hijo exonerado */
    COMBO_STOCK_BAJO_ITEM: {
        codigo: "636363",
        nombre: "Combo items con uno sin stock",
        cantidad: 4,
    } as ItemVenta,

    /** Ítem con variantes (stock flexible) */
    ITEM_VARIANTE_FLEXIBLE: {
        codigo: "313131",
        nombre: "item con variante flexible",
        cantidad: 1,
    } as ItemVenta,

    /** Ítem con variantes (stock estricto) — para prueba de bloqueo */
    ITEM_VARIANTE_ESTRICTO: {
        codigo: "131313",
        nombre: "item variante estricto gravado",
        cantidad: 1,
    } as ItemVenta,

    /** Receta cuyo componente no tiene stock — para prueba de bloqueo */
    RECETA_SIN_STOCK: {
        codigo: "112121",
        nombre: "Receta con item sin Sotck",
        cantidad: 1,
    } as ItemVenta,

    /** Lista de productos con un ítem sin stock — para prueba de bloqueo */
    LISTA_SIN_STOCK: {
        codigo: "434344",
        nombre: "Lista con un item sin stock",
        cantidad: 1,
    } as ItemVenta,

    /** Ítem con selectores (stock estricto, selector obligatorio) */
    ITEM_SELECTOR_GRAVADO: {
        codigo: "454545",
        nombre: "item selector gravado",
        cantidad: 1,
    } as ItemVenta,

    /** Ítem con selectores (stock flexible) */
    ITEM_SELECTOR_FLEXIBLE: {
        codigo: "545454",
        nombre: "item selector flexible",
        cantidad: 1,
    } as ItemVenta,
};

// ─── Series por tipo de comprobante ───────────────────────────────────

export const SERIES = {
    BOLETA: "B001",
    FACTURA: "F001",
    NOTA_VENTA: "NV01",
};

// ─── Almacenes para validación cruzada con Logística ──────────────────

export const ALMACENES_PV = {
    VENTAS: "ALMACÉN DE VENTAS",
    AUTO: "ALMACEN-AUTO",
};

// ─── Cajas de venta ───────────────────────────────────────────────────

export const CAJAS = {
    /** Caja principal de automatización — mapeada al ID real del sistema */
    AUTO: {
        id: 16675,
        nombre: "caja-auto",
        codigo: "a14ec47a-2",
    },
    VENTA: {
        id: 16673,
        nombre: "Caja de venta",
        codigo: "da192a84-b",
    },
};

// ─── Sucursal ─────────────────────────────────────────────────────────

export const SUCURSAL = {
    id: 27747,
    nombre: "SUCURSAL VENTAS",
};

// ─── IDs de tipo de comprobante (del sistema) ─────────────────────────

export const TIPO_COMPROBANTE_IDS = {
    FACTURA: 1003,
    BOLETA: 1004,
    NOTA_CREDITO: 1005,
    NOTA_DEBITO: 1006,
    NOTA_VENTA: 2016,
};
export const DETRACCION = {
    TIPOS_OPERACION: {
        BASE: "Operación Sujeta a Detracción",
        TRANSPORTE_CARGA:
            "Operación Sujeta a Detracción - Servicio de Transporte de Carga",
        TRANSPORTE_PASAJEROS:
            "Operación Sujeta a Detracción - Servicio de Transporte de Pasajeros",
    },
};

export const EMAILS = {
    QA_PRUEBAS: 'srqapruebaserp2@gmail.com',
};

// ─── Sobrescritura dinámica de códigos ─────────────────────────────────
// Si existe dynamic-items.json (generado por el setup), sobrescribe los
// códigos hardcodeados con los códigos dinámicos de esta ejecución.

try {
    const {cargarMapaCodigos} = require('../../factories/item-factory');
    const mapa = cargarMapaCodigos();
    if (mapa) {
        console.log(`[emision-data] Códigos dinámicos activos (RUN_ID: ${mapa.RUN_ID})`);

        const sobrescribir = (obj: Record<string, {codigo: string}>, claves: string[]) => {
            for (const clave of claves) {
                if (mapa[clave] && obj[clave]) {
                    obj[clave].codigo = mapa[clave].replace(/-/g, '');
                }
            }
        };

        // ITEMS_PV: todas las claves del objeto
        sobrescribir(ITEMS_PV as Record<string, {codigo: string}>, Object.keys(ITEMS_PV));

        // ITEMS_POR_ALMACEN: mapeo manual (las claves en el factory son diferentes)
        if (mapa['SOLO_EN_AUTO'] && ITEMS_POR_ALMACEN.SOLO_EN_AUTO) {
            ITEMS_POR_ALMACEN.SOLO_EN_AUTO.codigo = mapa['SOLO_EN_AUTO'].replace(/-/g, '');
        }
        if (mapa['SOLO_EN_VENTAS'] && ITEMS_POR_ALMACEN.SOLO_EN_VENTAS) {
            ITEMS_POR_ALMACEN.SOLO_EN_VENTAS.codigo = mapa['SOLO_EN_VENTAS'].replace(/-/g, '');
        }
    } else {
        console.warn('[emision-data] dynamic-items.json no encontrado. Usando códigos base estáticos.');
        console.warn('[emision-data] Ejecuta el setup primero para crear items dinámicos.');
    }
} catch {
    console.warn('[emision-data] Error al cargar dynamic-items.json. Usando códigos base estáticos.');
}
