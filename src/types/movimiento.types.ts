/**
 * Tipos e interfaces compartidos para el módulo de Movimientos de Logística.
 *
 * Usados por page objects, helpers y fixtures del submódulo MovimientosLogistica.
 *
 * Re-exportado desde helpers/Logistica/movimiento.types.ts para backward compat.
 */

/** Datos de un ítem de test reutilizable */
export interface ItemTest {
    codigo: string;
    nombre: string;
}

/** Datos para crear un proveedor nuevo desde datos opcionales */
export interface ProveedorData {
    tipoDocumento: string;   // 'DNI' | 'RUC'
    numDocumento: string;
    razonSocial?: string;    // Fallback si SUNAT/RENIEC no devuelve nombre
    direccion?: string;
    telefono?: string;
    email?: string;
}

/** Datos de un comprobante relacionado */
export interface ComprobanteData {
    tipo: string;       // 'FACTURA' | 'BOLETA'
    serie: string;      // 'F001'
    numero: string;     // '1234'
    cuc?: string;       // '10101010101'
}

/** Opciones de campo adicional */
export interface CampoAdicionalTexto {
    tipo: 'texto';
    nombre: string;
    valor: string;
}

export interface CampoAdicionalFecha {
    tipo: 'fecha';
    nombre: string;
    // La fecha se selecciona del calendario, no se tipea
}

export interface CampoAdicionalSeleccion {
    tipo: 'seleccion';
    nombre: string;
    opciones: string[];
    seleccionPorDefecto?: boolean;
}

export interface CampoAdicionalNumero {
    tipo: 'numero';
    nombre: string;
    valor: string;
}

export type CampoAdicional =
    | CampoAdicionalTexto
    | CampoAdicionalFecha
    | CampoAdicionalSeleccion
    | CampoAdicionalNumero;
