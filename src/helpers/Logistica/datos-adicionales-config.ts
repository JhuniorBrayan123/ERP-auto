export interface CampoAdicionalConfig {
    tipo: 'texto' | 'fecha' | 'seleccion' | 'numero';
    nombre: string;
    opciones?: string[];
    seleccionPorDefecto?: boolean;
}

export const CAMPOS_INGRESOS: CampoAdicionalConfig[] = [
    { tipo: 'texto', nombre: 'nombre ingreso' },
    { tipo: 'seleccion', nombre: 'entorno', opciones: ['certificación', 'producción'] },
    { tipo: 'fecha', nombre: 'fecha-test' },
];

export const CAMPOS_TRASLADOS: CampoAdicionalConfig[] = [
    { tipo: 'texto', nombre: 'nombre de traslado' },
];

export const CAMPOS_AJUSTES: CampoAdicionalConfig[] = [
    { tipo: 'texto', nombre: 'nombre' },
    { tipo: 'fecha', nombre: 'fecha' },
    { tipo: 'numero', nombre: 'numero de test' },
    { tipo: 'seleccion', nombre: 'entorno', opciones: ['certificación', 'producción'], seleccionPorDefecto: true },
];
