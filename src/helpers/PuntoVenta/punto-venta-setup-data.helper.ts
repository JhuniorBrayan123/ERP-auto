/**
 * Configuración centralizada de datos base para el setup de PuntoVenta.
 *
 * Contiene las interfaces y constantes que usa el setup idempotente
 * (punto-venta-datos.setup.ts) para garantizar que vendedores,
 * clientes y campos adicionales existan antes de correr los tests.
 *
 * REGLA: si un test necesita un nuevo dato base, agregarlo aquí
 * en vez de crearlo dentro del spec.
 */

// ═══════════════════════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════════════════════

/** Datos para crear/verificar un vendedor en PuntoVenta */
export interface VendedorData {
    documento: string;
    nombre: string;
    metaMonto: string;
    metaCantidad: string;
    zona: string;
    direccion: string;
    telefono: string;
    email: string;
}

/** Datos para crear/verificar un cliente en PuntoVenta */
export interface ClienteSetupData {
    tipoDocumento: 'DNI' | 'RUC';
    documento: string;
    /** Razón social (RUC) o nombre (DNI — se autocompleta con RENIEC) */
    razonSocial?: string;
    direccion: string;
    telefono: string;
    email: string;
    /**
     * Texto visible en la grilla/resultados que confirma que ya existe.
     * Se usa para la detección idempotente (Find-or-Create).
     */
    textoExistencia: string;
}

/** Configuración de un campo adicional de PuntoVenta (dentro de Datos de la caja) */
export interface CampoAdicionalPVConfig {
    tipo: 'texto' | 'fecha' | 'seleccion' | 'numero';
    nombre: string;
    /** Solo para campos de tipo 'seleccion' */
    opciones?: string[];
    /** Aplica a todos los tipos de documento */
    aplicarATodos: boolean;
}

// ═══════════════════════════════════════════════════════════════════════
// Constantes — Vendedor
// ═══════════════════════════════════════════════════════════════════════

export const VENDEDOR_PV: VendedorData = {
    documento: '76975258',
    nombre: 'Vendedor auto',
    metaMonto: '2500',
    metaCantidad: '3500',
    zona: 'Arequipa Sur',
    direccion: 'Arequipa-Paucarpata',
    telefono: '99999999',
    email: 'automatizacionerp2@gmail.com',
};

// ═══════════════════════════════════════════════════════════════════════
// Constantes — Clientes
// ═══════════════════════════════════════════════════════════════════════

/** Cliente persona natural (DNI) — se usa en boletas sin RUC */
export const CLIENTE_DNI_PV: ClienteSetupData = {
    tipoDocumento: 'DNI',
    documento: '76958585',
    direccion: 'Arequipa-auto',
    telefono: '99999999',
    email: 'automatizacionerp2@gmail.com',
    textoExistencia: '76958585',
};

/** Cliente empresa (RUC) — se usa en facturas */
export const CLIENTE_RUC_PV: ClienteSetupData = {
    tipoDocumento: 'RUC',
    documento: '20759685854',
    razonSocial: 'automatizacionerp2 cliente RUC',
    direccion: 'arequipa auto',
    telefono: '99999999',
    email: 'automatizacionerp2@gmail.com',
    textoExistencia: '20759685854',
};

// ═══════════════════════════════════════════════════════════════════════
// Constantes — Campos Adicionales (dentro de la caja / venta)
// ═══════════════════════════════════════════════════════════════════════

export const CAMPOS_PV: CampoAdicionalPVConfig[] = [
    {
        tipo: 'texto',
        nombre: 'tipo de comprobante',
        aplicarATodos: true,
    },
    {
        tipo: 'fecha',
        nombre: 'fecha-comprobante',
        aplicarATodos: true,
    },
    {
        tipo: 'seleccion',
        nombre: 'entorno',
        opciones: ['certificación', 'producción'],
        aplicarATodos: true,
    },
    {
        tipo: 'numero',
        nombre: 'numero-comprobante',
        aplicarATodos: true,
    },
];
