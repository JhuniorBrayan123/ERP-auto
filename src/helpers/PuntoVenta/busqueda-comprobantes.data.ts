export const BC_COLUMNAS_ESPERADAS = [
    'Tipo de comprobante',
    'Serie',
    'Correlativo',
    'Nombre/Razón Social',
    'Sucursal/Caja',
    'Estado de comprobante',
] as const;

export const BC_COLUMNAS_NO_ESPERADAS = [
    'N° de documento',
    'Fecha/Hora de creación',
    'Fecha de emisión',
    'Usuario creador',
    'Peso',
    'Condición de pago',
    'Método de pago',
    'Moneda',
    'Subtotal',
    'IGV',
    'Monto total',
    'Monto pagado',
    'Monto adeudado',
    'Estado de pago',
    'Estado de SUNAT',
] as const;

export const BC_COLUMN_IDS = {
    TIPO_DOCUMENTOS: 'TipoDocumentos',
    SERIES: 'Series',
    CORRELATIVO: 'Correlativo',
    RAZON_SOCIAL: 'IdRazonSocial',
    IDS_CAJAS: 'IdsCajas',
    LISTA_ESTADOS: 'ListEstados',

    NUMERO_DOCUMENTO: 'NumeroDocumento',
    FECHA_CREACION: 'FCreacion',
    FECHA_EMISION: 'FEmision',
    USUARIO_CREADOR: 'UsuarioCreador',
    PESO: 'Peso',
    CONDICIONES_PAGO: 'CondicionesPago',
    METODOS_PAGO: 'MetodosPago',
    MONEDAS: 'Monedas',
    SUBTOTAL: 'Subtotal',
    IGV: 'IGV',
    MONTO_TOTAL: 'Mtotal',
    MONTO_PAGADO: 'MontoPagado',
    MONTO_ADEUDADO: 'MontoAdeudado',
    ESTADO_PAGO: 'EstadoPago',
    ESTADOS_SUNAT: 'ListEstadosSunat',

    // Campos de la categoría Origen (COTIZACIONES | PEDIDOS).
    // DOM discovery 13-Ago-2026: item-{CAT}-IdsFacturados / item-{CAT}-BusquedaVinculados
    // existen en la configuración de columnas de ambas categorías.
    FACTURADO: 'IdsFacturados',
    REFERENCIA_VENTA: 'BusquedaVinculados',
} as const;

export const BC_COLUMNAS_DEFAULT_ACTIVAS = [
    'FCreacion', 'FEmision', 'Subtotal', 'Mtotal',
    'MontoPagado', 'MontoAdeudado', 'EstadoPago', 'ListEstadosSunat',
] as const;

export const BC_COLUMNAS_DESACTIVAR_EN_BC09 = [
    'NumeroDocumento', 'UsuarioCreador',
    'Peso', 'CondicionesPago', 'MetodosPago', 'Monedas',
    'Subtotal', 'IGV', 'Mtotal', 'MontoPagado',
    'MontoAdeudado', 'EstadoPago', 'ListEstadosSunat',
] as const;

export type BcCategoria = 'TODOS' | 'VENTAS' | 'FACTURACION' | 'GUIAS' | 'COTIZACIONES' | 'PEDIDOS';

export const BC_CATEGORIAS: Record<BcCategoria, BcCategoria> = {
    TODOS: 'TODOS',
    VENTAS: 'VENTAS',
    FACTURACION: 'FACTURACION',
    GUIAS: 'GUIAS',
    COTIZACIONES: 'COTIZACIONES',
    PEDIDOS: 'PEDIDOS',
} as const;

export const BC_TIPOS_COMPROBANTE = {
    BOLETA: 'Boleta',
    FACTURA: 'Factura',
    NOTA_VENTA: 'Nota de venta',
    COTIZACION: 'Cotización',
    PEDIDO: 'Pedido',
    GUIA_REMISION: 'Guía de Remisión',
    NOTA_CREDITO: 'Nota de crédito',
    NOTA_DEBITO: 'Nota de débito',
} as const;

export const BC_ACCIONES = {
    BITACORA: 'Bitácora',
    VER_COMPROBANTE: 'Ver comprobante',
    CLONAR: 'Clonar comprobante',
    ELIMINAR: 'Eliminar comprobante',
    EMITIR: 'Emitir',
} as const;

export type BcPresetFecha = 'Hoy' | 'Últimos 7 días' | 'Últimos 14 días' | 'Últimos 30 días';

export const BC_PRESETS_FECHA: Record<string, BcPresetFecha> = {
    HOY: 'Hoy',
    SIETE: 'Últimos 7 días',
    CATORCE: 'Últimos 14 días',
    TREINTA: 'Últimos 30 días',
} as const;

export const BC_MOTIVOS_ELIMINACION = {
    ERROR_DATOS: 'Error de datos',
} as const;

export type DatosOpcionales = {
    vendedorNombre: string;
    ordenCompra: string;
    contrato: string;
    comentarios: string;
    campoTexto0: string;
    campoNumero0: string;
};

export type ComprobanteInfo = {
    tipo: string;
    serie: string;
    correlativo: string;
    numeroCompleto: string;
    cliente: string;
    estado?: string;
    datosOpcionales?: DatosOpcionales;
};

/**
 * True si la celda de la columna "Facturado" indica que el comprobante origen
 * (Cotización/Pedido) ya fue transformado a un comprobante de pago.
 *
 * Formato esperado del producto: "Sí" (con tilde — confirmado por DOM discovery
 * 13-Ago-2026 en CRT-1) o "SI". Decisión QA 13-Ago-2026: NO se valida correlativo
 * ni "SI N°", solo el estado positivo. El bug de producto CT01-174/B001-631 muestra
 * "No" pese a estar facturado: en ese caso la validación integrada falla a propósito
 * (no se silencia ni se hace skip) para evidenciar la regresión.
 */
export const esFacturadoSi = (valor: string): boolean => /^S[ií]/i.test(valor);
