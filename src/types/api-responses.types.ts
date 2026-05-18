0

/**
 * Tipos para las respuestas crudas de las APIs del ERP.
 *
 * Estos tipos representan la forma REAL del JSON que devuelve cada endpoint,
 * con propiedades en PascalCase tal como vienen del backend .NET.
 *
 * Se usan en los Services (CajasApi, KardexApi, etc.) para reemplazar `any`
 * en los `.map()` y `.find()` de parseo de respuestas.
 */

// ─── Cajas de Venta ───────────────────────────────────────────────────

export interface CajaVentaRaw {
    Id: number;
    Nombre: string;
    Codigo: string;
    Estado: number;
    IdSucursal: number;
    Sucursal?: { Descripcion?: string };
    Almacenes?: AlmacenCajaRaw[];
    IdTipoDocDefecto: number;
    UltimoCuadreCaja?: { Id?: number; Estado?: number };
}

export interface AlmacenCajaRaw {
    IdAlmacen: number;
    NombreAlmacen: string;
    Defecto: number;
}

// ─── Kardex ───────────────────────────────────────────────────────────

export interface KardexAlmacenRaw {
    DescripcionAlmacen?: string;
    SaldoFinal: number;
}

export interface KardexVariacionRaw {
    CodigoItem: string;
    Almacenes?: KardexAlmacenRaw[];
}

export interface KardexDataItemRaw {
    Almacenes?: KardexAlmacenRaw[];
    Variaciones?: KardexVariacionRaw[];
}

// ─── Comprobantes / SUNAT ─────────────────────────────────────────────

export interface ComprobanteConsultaRaw {
    IdComprobanteERP: number;
    IdestadoSunat?: number;
    EstadoDescripcion?: string;
    SerieDescripcion?: string;
    CorrelativoDocumento?: number;
    Monto?: number;
    TipoDocDescripcion?: string;
    FechaEmision?: string;
}

export interface ComprobantesCollectionResponseRaw {
    ComprobantesCollectionResponse?: {
        Data?: ComprobanteConsultaRaw[];
    };
}
