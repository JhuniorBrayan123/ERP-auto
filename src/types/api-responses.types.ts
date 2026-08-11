
export interface MontoActualMonedaRaw {
    IdMoneda?: number;
    DescripcionMoneda?: string;
    MontoActual?: number;
    DescripcionTipo?: string;
}

export interface CajaVentaRaw {
    Id: number;
    Nombre: string;
    Codigo: string;
    Estado: number;
    IdSucursal: number;
    Sucursal?: { Descripcion?: string };
    Almacenes?: AlmacenCajaRaw[];
    IdTipoDocDefecto: number;
    UltimoCuadreCaja?: { Id?: number; Estado?: number; MontoActualxMoneda?: MontoActualMonedaRaw[] };
}

export interface AlmacenCajaRaw {
    IdAlmacen: number;
    NombreAlmacen: string;
    Defecto: number;
}

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
