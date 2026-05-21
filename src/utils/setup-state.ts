/**
 * Gestor centralizado de estado para setup files de Playwright.
 *
 * Persiste el estado de completitud de cada setup en
 * playwright/.auth/setup-state.json, permitiendo auto-skip en
 * ejecuciones subsecuentes sin necesidad de variables manuales SKIP_*.
 *
 * Funcionamiento:
 * 1. Al iniciar un setup → shouldSkipSetup() chequea SKIP_* (prioridad)
 *    + environment match + estado completado.
 * 2. Al finalizar exitosamente → markSetupComplete() persiste el estado.
 * 3. Si cambia APP_ENV → se invalida TODO el estado.
 *
 * Backward compatible: SKIP_* env vars tienen prioridad absoluta.
 */

import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {env} from '../../config/env';

// ─── Constantes ──────────────────────────────────────────────────────────

const AUTH_DIR = resolve(process.cwd(), 'playwright', '.auth');
const STATE_FILE = resolve(AUTH_DIR, 'setup-state.json');

/** Nombres de setup conocidos (usados como lookup key en el JSON). */
const SETUP_NAMES = [
    'auth',
    'punto-venta-items',
    'punto-venta-datos',
    'datos-adicionales',
] as const;

type SetupName = (typeof SETUP_NAMES)[number];

/**
 * Mapa: setup name → variable de entorno SKIP_* correspondiente.
 * Ej: 'auth' → SKIP_PV_SETUP (reutiliza la variable existente)
 */
const SKIP_ENV_MAP: Record<string, string> = {
    'auth': 'SKIP_PV_SETUP',
    'punto-venta-items': 'SKIP_PV_ITEMS_SETUP',
    'punto-venta-datos': 'SKIP_PV_SETUP',
    'datos-adicionales': 'SKIP_DATOS_SETUP',
};

// ─── Tipos ───────────────────────────────────────────────────────────────

export interface SetupEntry {
    /** true si el setup completó exitosamente */
    completed: boolean;
    /** ISO timestamp de la última ejecución exitosa */
    timestamp: string;
}

export interface SetupState {
    /** Grupo de ambiente en el que se ejecutó ("crt-group" | "prd") */
    environment: string;
    /** Cuenta (USER_EMAIL) con la que se ejecutó */
    account?: string;
    /** Mapa setupName → entry */
    setups: Record<string, SetupEntry>;
}

// ─── Utilidades internas ─────────────────────────────────────────────────

/**
 * Detecta el grupo de ambiente actual.
 * Normaliza crt/crt-2/crt-3/crt-4 → "crt-group", prd → "prd".
 */
function detectEnvironmentGroup(): string {
    const env = (process.env.APP_ENV ?? '').trim().toLowerCase();
    return env === 'prd' ? 'prd' : 'crt-group';
}

/**
 * Detecta la cuenta actual desde USER_EMAIL.
 * Retorna "unknown" si USER_EMAIL no está definido o está vacío.
 */
function detectAccount(): string {
    return (env.userEmail ?? '').trim().toLowerCase() || 'unknown';
}

/**
 * Asegura que el directorio .auth exista.
 */
function ensureAuthDir(): void {
    if (!existsSync(AUTH_DIR)) {
        mkdirSync(AUTH_DIR, {recursive: true});
    }
}

/**
 * Retorna el estado por defecto (ningún setup completado).
 */
function defaultState(): SetupState {
    return {
        environment: detectEnvironmentGroup(),
        account: detectAccount(),
        setups: {},
    };
}

// ─── API pública ─────────────────────────────────────────────────────────

/**
 * Carga el estado persistente desde setup-state.json.
 * Si el archivo no existe o está corrupto, retorna el estado por defecto.
 */
export function loadSetupState(): SetupState {
    if (!existsSync(STATE_FILE)) {
        return defaultState();
    }
    try {
        const raw = readFileSync(STATE_FILE, 'utf-8');
        return JSON.parse(raw) as SetupState;
    } catch {
        return defaultState();
    }
}

/**
 * Guarda el estado en setup-state.json.
 * Crea el directorio .auth si no existe.
 */
export function saveSetupState(state: SetupState): void {
    ensureAuthDir();
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

/**
 * Decide si un setup debe saltarse.
 *
 * Orden de chequeo:
 * 1. Si la variable SKIP_* está seteada → skip (backward compat)
 * 2. Si cambió el grupo de ambiente (crt-group/prd) respecto al estado guardado → NO skip
 * 3. Si cambió la cuenta (USER_EMAIL) respecto al estado guardado → NO skip
 * 4. Si el setup está marcado como completado → skip
 * 5. En cualquier otro caso → NO skip (ejecutar normalmente)
 */
export function shouldSkipSetup(setupName: string): boolean {
    // 1. Chequeo de variable de entorno SKIP_* (backward compat — prioridad absoluta)
    const envVar = SKIP_ENV_MAP[setupName];
    if (envVar && process.env[envVar] === '1') {
        console.log(`[setup-state] ${setupName}: SKIP detectado por variable ${envVar}=1`);
        return true;
    }

    // 2. Cargar estado
    const state = loadSetupState();

    // 3. Si no hay entries registradas → no skippear
    if (!state.setups[setupName]) {
        return false;
    }

    const entry = state.setups[setupName];

    // 4. Si cambió el grupo de ambiente → invalidar → no skippear
    const currentEnvGroup = detectEnvironmentGroup();
    if (state.environment !== currentEnvGroup) {
        console.log(`[setup-state] ${setupName}: ambiente cambió de "${state.environment}" a "${currentEnvGroup}" — ejecutando setup`);
        return false;
    }

    // 5. Si cambió la cuenta → invalidar → no skippear
    const currentAccount = detectAccount();
    if (state.account !== currentAccount) {
        console.log(`[setup-state] ${setupName}: cuenta cambió de "${state.account ?? '(ninguna)'}" a "${currentAccount}" — ejecutando setup`);
        return false;
    }

    // 6. Si el setup está completado → skippear
    if (entry.completed) {
        console.log(`[setup-state] ${setupName}: ya completado — saltando`);
        return true;
    }

    return false;
}

/**
 * Marca un setup como completado exitosamente.
 * Persiste el estado a disco inmediatamente (para sobrevivir a crashes).
 */
export function markSetupComplete(setupName: string): void {
    const state = loadSetupState();
    state.environment = detectEnvironmentGroup();
    state.account = detectAccount();
    state.setups[setupName] = {
        completed: true,
        timestamp: new Date().toISOString(),
    };
    saveSetupState(state);
    console.log(`[setup-state] ${setupName}: marcado como completado`);
}

/**
 * Retorna un resumen legible del estado de todos los setups.
 * Útil para mostrar en el menú test-runner o en reportes.
 */
export function getSetupStateSummary(): string {
    const state = loadSetupState();
    const lines: string[] = [];
    lines.push(`Ambiente: ${state.environment}`);
    lines.push(`Cuenta: ${state.account ?? '(no registrada)'}`);

    const allNames = [...SETUP_NAMES];
    for (const name of allNames) {
        const entry = state.setups[name];
        if (entry?.completed) {
            const fecha = new Date(entry.timestamp).toLocaleString('es-PE');
            lines.push(`  ✓ ${name}: completado (${fecha})`);
        } else {
            lines.push(`  ○ ${name}: pendiente`);
        }
    }

    return lines.join('\n');
}

/**
 * Retorna true si todos los setups conocidos están completados.
 */
export function areAllSetupsComplete(): boolean {
    const state = loadSetupState();
    if (!state.environment) return false;
    const currentEnvGroup = detectEnvironmentGroup();
    if (state.environment !== currentEnvGroup) return false;
    const currentAccount = detectAccount();
    if (state.account !== currentAccount) return false;
    return SETUP_NAMES.every(name => state.setups[name]?.completed === true);
}
