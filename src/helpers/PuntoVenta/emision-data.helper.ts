import type {DatosCliente, ItemVenta} from "./emision.types";
import type {TipoDocumentoOrigen} from "@screenplay/interactions/notas/VincularComprobante";

export const TIPOS_COMPROBANTE = {
    BOLETA: "BOLETA",
    FACTURA: "FACTURA",
    NOTA_VENTA: "NOTA DE VENTA",
    COTIZACION: "COTIZACIÓN",
    PEDIDO: "PEDIDO",
} as const;

export const TIPOS_DOCUMENTO_ORIGEN: Record<string, TipoDocumentoOrigen> = {
    FACTURA: 'Factura',
    BOLETA: 'Boleta',
};

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
        tipoDocumento: "DNI",
        documento: "76958585",
        nombre: "MARCELO EDWIN SOLANO GARAY",
        textoSelector:
            "DNIDoc. Nacional de Identidad7695858599999999MARCELO EDWIN SOLANO GARAYArequipa",
    } as DatosCliente & { textoSelector: string },

    CLIENTE_SIN_DOC: {
        tipoDocumento: "",
        documento: "",
        nombre: "Automatizador qa",
        direccion: "Arequipa",
    } as DatosCliente & { direccion: string },

    EMPRESA_RUC_AUTO: {
        tipoDocumento: "RUC",
        documento: "20759685854",
        nombre: "automatizacionerp2 cliente RUC",

        textoSelector:
            "RUCReg. Único de Contribuyentes2075968585499999999automatizacionerp2 cliente",
    } as DatosCliente & { textoSelector: string },

    PERSONA_AUTO: {
        tipoDocumento: "DNI",
        documento: "76975258",
        nombre: "Vendedor auto",
    } as DatosCliente,

    PERSONA_EXTRANJERIA: {
        tipoDocumento: "Carnet Extranjeria",
        documento: "E12345678",
        nombre: "Cliente Extranjería",
        direccion: "Dirección automatizado qa",
    } as DatosCliente,
};
export const CLIENTE_EXTRANJERIA_NC_EXPORTACION = {
    nombre: 'Cliente Extranjería',
    tipoDocumento: 'Carnet Extranjeria',
    numeroDocumento: 'E12345678',
    codigoCliente: '123546',
    direccion: 'Dirección automatizado qa',
    telefono: '999999999',
    correo: 'srqapruebaserp2@gmail.com',
};
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
    PRODUCTO_SIMPLE: {
        codigo: "111111",
        nombre: "Item para combos estricto",
        cantidad: 1,
    } as ItemVenta,

    PRODUCTO_GRAVADO: {
        codigo: "121212",
        nombre: "item para combos gravado",
        cantidad: 1,
    } as ItemVenta,

    ITEM_GRAVADO_SIN_CONTROL: {
        codigo: "151515",
        nombre: "item gravado sin control",
        cantidad: 1,
    } as ItemVenta,

    ITEM_EQUIVALENTE: {
        codigo: "202020",
        nombre: "item equivalente flexible",
        cantidad: 1,
    } as ItemVenta,

    ITEM_ISC: {
        codigo: "112211",
        nombre: "Producto con ISC fijo 27-4-",
        cantidad: 1,
    } as ItemVenta,

    ITEM_ICBPER: {
        codigo: "221122",
        nombre: "Producto con ICBPER 27-4-",
        cantidad: 1,
    } as ItemVenta,

    RECETA_INSUMOS: {
        codigo: "332211",
        nombre: "Receta productos estrictos",
        cantidad: 1,
    } as ItemVenta,

    LISTA_ITEMS: {
        codigo: "443444",
        nombre: "Lista items flexibles 27-4-",
        cantidad: 1,
    } as ItemVenta,

    LISTA_ITEMS_ESTRICTOS: {
        codigo: "447744",
        nombre: "Lista items estrictos",
        cantidad: 1,
    } as ItemVenta,

    PRODUCTO_SIN_STOCK: {
        codigo: "111222",
        nombre: "Item sin stock estricto",
        cantidad: 1,
    } as ItemVenta,

    COMBO_EXONERADO: {
        codigo: "222222",
        nombre: "combo hijo exonegaro item",
        cantidad: 1,
    } as ItemVenta,
    COMBO_STOCK_BAJO_ITEM: {
        codigo: "636363",
        nombre: "Combo items con uno sin stock",
        cantidad: 4,
    } as ItemVenta,

    COMBO_ESTRICTO: {
        codigo: "550055",
        nombre: "combo items estrictos",
        cantidad: 1,
    } as ItemVenta,

    ITEM_VARIANTE_FLEXIBLE: {
        codigo: "313131",
        nombre: "item con variante flexible",
        cantidad: 1,
    } as ItemVenta,

    ITEM_VARIANTE_ESTRICTO: {
        codigo: "131313",
        nombre: "item variante estricto gravado",
        cantidad: 1,
    } as ItemVenta,

    ITEM_EQUIVALENTE_SIN_CONTROL: {
        codigo: "303030",
        nombre: "item equivalente sin control gravado",
        cantidad: 1,
    } as ItemVenta,

    ITEM_VARIANTE_SIN_CONTROL: {
        codigo: "333333",
        nombre: "item variante sin control gravado",
        cantidad: 1,
    } as ItemVenta,

    RECETA_SIN_STOCK: {
        codigo: "112121",
        nombre: "Receta con item sin Sotck",
        cantidad: 1,
    } as ItemVenta,

    LISTA_SIN_STOCK: {
        codigo: "434344",
        nombre: "Lista con un item sin stock",
        cantidad: 1,
    } as ItemVenta,

    ITEM_SELECTOR_GRAVADO: {
        codigo: "454545",
        nombre: "item selector gravado",
        cantidad: 1,
    } as ItemVenta,

    ITEM_SELECTOR_FLEXIBLE: {
        codigo: "545454",
        nombre: "item selector flexible",
        cantidad: 1,
    } as ItemVenta,

    ESTRICTO_GRAVADO_1: {
        codigo: "111112",
        nombre: "Item control estricto gravado 1",
        cantidad: 1,
    } as ItemVenta,

    ESTRICTO_GRAVADO_2: {
        codigo: "111113",
        nombre: "Item control estricto gravado 2",
        cantidad: 1,
    } as ItemVenta,

    ESTRICTO_GRAVADO_3: {
        codigo: "111114",
        nombre: "Item control estricto gravado 3",
        cantidad: 1,
    } as ItemVenta,

    ESTRICTO_GRAVADO_4: {
        codigo: "111115",
        nombre: "Item control estricto gravado 4",
        cantidad: 1,
    } as ItemVenta,

    ESTRICTO_GRAVADO_5: {
        codigo: "111116",
        nombre: "Item control estricto gravado 5",
        cantidad: 1,
    } as ItemVenta,

    ESTRICTO_GRAVADO_6: {
        codigo: "111117",
        nombre: "Item control estricto gravado 6",
        cantidad: 1,
    } as ItemVenta,

    ESTRICTO_GRAVADO_7: {
        codigo: "111118",
        nombre: "Item control estricto gravado 7",
        cantidad: 1,
    } as ItemVenta,

    ESTRICTO_GRAVADO_8: {
        codigo: "111119",
        nombre: "Item control estricto gravado 8",
        cantidad: 1,
    } as ItemVenta,

    ESTRICTO_GRAVADO_9: {
        codigo: "111120",
        nombre: "Item control estricto gravado 9",
        cantidad: 1,
    } as ItemVenta,

    ESTRICTO_GRAVADO_10: {
        codigo: "111121",
        nombre: "Item control estricto gravado 10",
        cantidad: 1,
    } as ItemVenta,

};

export const SERIES = {
    BOLETA: "B001",
    FACTURA: "F001",
    NOTA_VENTA: "NV01",
};

export const ALMACENES_PV = {
    VENTAS: "ALMACÉN DE VENTAS",
    AUTO: "ALMACEN-AUTO",
};

export const CAJAS = {
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

export const SUCURSAL = {
    id: 27747,
    nombre: "SUCURSAL VENTAS",
};

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

try {
    const {cargarMapaCodigos} = require('../../factories/item-factory');
    const mapa = cargarMapaCodigos();
    if (mapa) {
        console.log(`[emision-data] Códigos dinámicos activos (RUN_ID: ${mapa.RUN_ID})`);

        const sobrescribir = (obj: Record<string, { codigo: string }>, claves: string[]) => {
            for (const clave of claves) {
                if (mapa[clave] && obj[clave]) {
                    obj[clave].codigo = mapa[clave].replace(/-/g, '');
                }
            }
        };

        sobrescribir(ITEMS_PV as Record<string, { codigo: string }>, Object.keys(ITEMS_PV));

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
