import type {ComprobanteData, ItemTest, ProveedorData} from './movimiento.types';

export const ITEMS_TEST = {
    PRODUCTO_ESTRICTO: {codigo: '111111', nombre: 'Item para combos estricto'} as ItemTest,
    PRODUCTO_GRAVADO: {codigo: '121212', nombre: 'item para combos gravado'} as ItemTest,
    VARIANTE_FLEXIBLE: {codigo: '313131', nombre: 'item con variante flexible'} as ItemTest,
    EQUIVALENTE_FLEX: {codigo: '202020', nombre: 'item equivalente flexible'} as ItemTest,
    EQUIVALENTE_EST: {codigo: '101010', nombre: 'item equivalente estricto gravado'} as ItemTest,
    INSUMO_FLEXIBLE: {codigo: '666444', nombre: 'nuevo insumo flexible'} as ItemTest,
    INSUMO_TEST1: {codigo: '464646', nombre: 'Nuevo insumo test1'} as ItemTest,
    VARIANTE_ESTRICTO: {codigo: '131313', nombre: 'item variante estricto gravado'} as ItemTest,
    SIN_STOCK: {codigo: '111222', nombre: 'Item sin stock estricto'} as ItemTest,
    MASIVO_PROD: {codigo: 'EDPROD00', nombre: 'Tippy'} as ItemTest,
    MASIVO_INSUMO: {codigo: 'EDINS002', nombre: ''} as ItemTest,

};

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
    V1_ESTRICTO: {
        nombre: 'Variante 1 estricto',
        codigo: '131313-V001',
    },
    EQUIVALENTE_X2: 'Equivalente X2',
};

export const ALMACENES = {
    AUTO: 'ALMACEN-AUTO',
    VENTAS: 'ALMACÉN DE VENTAS',
};

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

export const DATOS_CONTACTO = {
    TELEFONO: '963078103',
    EMAIL: 'srqapruebaserp2@gmail.com',
};

export const PROVEEDOR_TEST: ProveedorData = {
    tipoDocumento: 'DNI',
    numDocumento: '76975258',
    razonSocial: 'JHUNIOR BRAYAN GUTIERREZ',  
    direccion: 'av-ejemplo-auto',
    telefono: '99999999',
    email: 'ejemploauto@gmail.com',
};

export const PROVEEDOR_EXISTENTE = {
    numDocumento: '76975258',
    nombre: 'JHUNIOR BRAYAN GUTIERREZ',
};

export const COMPROBANTE_TEST: ComprobanteData = {
    tipo: 'FACTURA',
    serie: 'F001',
    numero: '1234',
    cuc: '10101010101',
};

export const COMPROBANTE_VACIO: ComprobanteData = {
    tipo: '',
    serie: '',
    numero: '',
    cuc: '',
}

try {
    const {cargarMapaCodigos} = require('../../factories/item-factory');
    const mapa = cargarMapaCodigos();
    if (mapa) {
        console.log(`[movimiento-data] Códigos dinámicos activos (RUN_ID: ${mapa.RUN_ID})`);

        const MAPA_CLAVES: Record<string, string> = {
            'PRODUCTO_ESTRICTO': 'PRODUCTO_SIMPLE',
            'PRODUCTO_GRAVADO': 'PRODUCTO_GRAVADO',
            'VARIANTE_FLEXIBLE': 'ITEM_VARIANTE_FLEXIBLE',
            'EQUIVALENTE_FLEX': 'ITEM_EQUIVALENTE',
            'EQUIVALENTE_EST': 'ITEM_EQUIVALENTE_ESTRICTO',
            'VARIANTE_ESTRICTO': 'ITEM_VARIANTE_ESTRICTO',
        };

        for (const [testKey, templateKey] of Object.entries(MAPA_CLAVES)) {
            const dynamicCode = mapa[templateKey];
            const itemTest = (ITEMS_TEST as Record<string, { codigo: string, nombre: string }>)[testKey];

            if (dynamicCode && itemTest) {
                
                itemTest.codigo = dynamicCode.replace(/-/g, '');

                const runIdSuffix = dynamicCode.split('-')[1];
                if (runIdSuffix) {
                    itemTest.nombre = `${itemTest.nombre} ${runIdSuffix}`;
                }
            }
        }

        const runId = mapa.RUN_ID as string;
        if (runId) {
            const codigoVarianteFlex = ITEMS_TEST.VARIANTE_FLEXIBLE.codigo;
            const codigoVarianteEst = ITEMS_TEST.VARIANTE_ESTRICTO.codigo;

            VARIANTES.V1_FLEXIBLE.codigo = `${codigoVarianteFlex}-V001`;
            VARIANTES.V1_FLEXIBLE.nombre = `Variante 1 flexible ${runId}`;

            VARIANTES.V2_FLEXIBLE.codigo = `${codigoVarianteFlex}-V002`;
            VARIANTES.V2_FLEXIBLE.nombre = `Variante 2 flexible ${runId}`;

            VARIANTES.V3_FLEXIBLE.codigo = `${codigoVarianteFlex}-V003`;
            VARIANTES.V3_FLEXIBLE.nombre = `Variante 3 flexible ${runId}`;

            VARIANTES.V1_ESTRICTO.codigo = `${codigoVarianteEst}-V001`;
            VARIANTES.V1_ESTRICTO.nombre = `Variante 1 estricto ${runId}`;
        }
    } else {
        console.warn('[movimiento-data] dynamic-items.json no encontrado. Usando códigos base estáticos.');
        console.warn('[movimiento-data] Ejecuta PuntoVenta > pv-items primero para crear items dinámicos.');
    }
} catch {
    console.warn('[movimiento-data] Error al cargar dynamic-items.json. Usando códigos base estáticos.');
}

export const EXCEL_MASIVOS = {
    INGRESOS: 'FORMATO_SUBIDA_MOVIMIENTOS_INGRESOS.xlsx',
    INGRESOS_INSUMOS: 'FORMATO_SUBIDA_MOVIMIENTOS_INGRESOS_INSUMOS.xlsx',
};

export const PATRON_CODIGO = {
    INGRESO: /M001-I-/,
    SALIDA: /M001-S-/,
    AJUSTE: /M001-A-/,
    TRASLADO: /M001-T-/,
};
