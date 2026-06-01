export type TipoComprobante = 'BOLETA' | 'FACTURA' | 'NOTA DE VENTA' | 'COTIZACIÓN' | 'PEDIDO';

export interface DatosCliente {

    tipoDocumento: string;

    documento: string;

    nombre: string;
}

export interface TipoGuia {
    publico: string;
    privado: string;
}

export interface ItemVenta {
    codigo: string;
    nombre: string;
    cantidad: number;

    precioUnitario?: number;
}

export type TipoDescuento = 'PORCENTAJE' | 'MONTO';

export interface DescuentoConfig {
    tipo: TipoDescuento;
    valor: number;

    esGlobal: boolean;

    itemIndex?: number;
}

export interface EmisionResult {
    serie: string;
    correlativo: string;

    comprobanteId: number;
}

export interface AdelantoConfig {
    monto: number;

    tipoComprobante: TipoComprobante;
    serie: string;
    correlativo: string;
}

export interface RetencionConfig {
    porcentaje: number;
}

export interface DetraccionConfig {
    codigoBienServicio: string;
    porcentaje: number;
}
