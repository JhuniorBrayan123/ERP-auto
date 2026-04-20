/**
 * Configuración centralizada de campos adicionales requeridos por tipo de movimiento.
 *
 * Estos datos son usados por el setup idempotente (datos-adicionales.setup.ts)
 * para garantizar que los campos existan antes de correr los tests.
 *
 * REGLA: si un test necesita un nuevo campo adicional, agregarlo aquí
 * en vez de crearlo dentro del spec.
 */

// ─── Tipo de configuración ─────────────────────────────────────────

export interface CampoAdicionalConfig {
    tipo: 'texto' | 'fecha' | 'seleccion' | 'numero';
    nombre: string;
    opciones?: string[];
    seleccionPorDefecto?: boolean;
}

// ─── Campos para INGRESOS ──────────────────────────────────────────

export const CAMPOS_INGRESOS: CampoAdicionalConfig[] = [
    { tipo: 'texto', nombre: 'nombre ingreso' },
    { tipo: 'seleccion', nombre: 'entorno', opciones: ['certificación', 'producción'] },
    { tipo: 'fecha', nombre: 'fecha-test' },
];

// ─── Campos para TRASLADOS ─────────────────────────────────────────

export const CAMPOS_TRASLADOS: CampoAdicionalConfig[] = [
    { tipo: 'texto', nombre: 'nombre de traslado' },
];

// ─── Campos para AJUSTES ───────────────────────────────────────────

export const CAMPOS_AJUSTES: CampoAdicionalConfig[] = [
    { tipo: 'texto', nombre: 'nombre' },
    { tipo: 'fecha', nombre: 'fecha' },
    { tipo: 'numero', nombre: 'numero de test' },
    { tipo: 'seleccion', nombre: 'entorno', opciones: ['certificación', 'producción'], seleccionPorDefecto: true },
];
