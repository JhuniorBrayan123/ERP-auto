/**
 * Tipos del dominio PuntoVenta / Emisiones.
 *
 * Centraliza las interfaces y enums que usan specs, helpers, flows y services.
 * NO incluir lógica aquí — solo definiciones de forma.
 *
 * Re-exportado desde helpers/PuntoVenta/emision.types.ts para backward compat.
 */

// ─── Tipos de comprobante ─────────────────────────────────────────────

export type TipoComprobante = 'BOLETA' | 'FACTURA' | 'NOTA DE VENTA';

// ─── Datos de cliente ─────────────────────────────────────────────────

export interface DatosCliente {
    /** Tipo de documento: DNI, RUC, CE, etc. */
    tipoDocumento: string;
    /** Número de documento */
    documento: string;
    /** Nombre o razón social */
    nombre: string;
}

// ─── Ítem de venta ────────────────────────────────────────────────────

export interface ItemVenta {
    codigo: string;
    nombre: string;
    cantidad: number;
    /** Precio unitario esperado (opcional, para assertions) */
    precioUnitario?: number;
}

// ─── Descuentos ───────────────────────────────────────────────────────

export type TipoDescuento = 'PORCENTAJE' | 'MONTO';

export interface DescuentoConfig {
    tipo: TipoDescuento;
    valor: number;
    /** Si true, aplica a nivel global; si false, aplica a un ítem específico */
    esGlobal: boolean;
    /** Índice del ítem al que aplica (solo si esGlobal = false) */
    itemIndex?: number;
}

// ─── Resultado de emisión ─────────────────────────────────────────────

export interface EmisionResult {
    serie: string;
    correlativo: string;
    /** IdComprobanteERP del sistema */
    comprobanteId: number;
}

// ─── Adelanto ─────────────────────────────────────────────────────────

export interface AdelantoConfig {
    monto: number;
    /** Tipo de comprobante del adelanto */
    tipoComprobante: TipoComprobante;
    serie: string;
    correlativo: string;
}

// ─── Retención / Detracción ───────────────────────────────────────────

export interface RetencionConfig {
    porcentaje: number;
}

export interface DetraccionConfig {
    codigoBienServicio: string;
    porcentaje: number;
}
