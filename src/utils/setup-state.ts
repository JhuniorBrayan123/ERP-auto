import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {env} from '../../config/env';

const AUTH_DIR = resolve(process.cwd(), 'playwright', '.auth');
const STATE_FILE = resolve(AUTH_DIR, 'setup-state.json');

export const PV_SETUP_NAMES = ['auth', 'punto-venta-datos', 'punto-venta-items'] as const;

export const LOG_SETUP_NAMES = ['auth', 'datos-adicionales'] as const;

export const SETUP_NAMES = [...PV_SETUP_NAMES, ...LOG_SETUP_NAMES] as const;

type SetupName = (typeof SETUP_NAMES)[number];

const SKIP_ENV_MAP: Record<string, string> = {
    'auth': 'SKIP_PV_SETUP',
    'punto-venta-items': 'SKIP_PV_ITEMS_SETUP',
    'punto-venta-datos': 'SKIP_PV_SETUP',
    'datos-adicionales': 'SKIP_DATOS_SETUP',
};

export interface SetupEntry {
        completed: boolean;
        timestamp: string;
}

export interface SetupProfile {
        setups: Record<string, SetupEntry>;
}

export interface SetupState {
    version: number;
        profiles: Record<string, SetupProfile>;
}

export function detectEnvironmentGroup(): string {
    const envVar = (process.env.APP_ENV ?? '').trim().toLowerCase();
    return envVar || 'crt';
}

export function detectAccount(): string {
    return (env.userEmail ?? '').trim().toLowerCase() || 'unknown';
}

export function getProfileKey(envGroup: string, account: string): string {
    return `${envGroup}_${account}`;
}

function ensureAuthDir(): void {
    if (!existsSync(AUTH_DIR)) {
        mkdirSync(AUTH_DIR, {recursive: true});
    }
}

function defaultState(): SetupState {
    return {
        version: 2,
        profiles: {},
    };
}

export function loadSetupState(): SetupState {
    if (!existsSync(STATE_FILE)) {
        return defaultState();
    }
    try {
        const raw = readFileSync(STATE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.version !== 2) {
            
            const newState = defaultState();
            if (parsed.environment && parsed.account && parsed.setups) {
                const key = getProfileKey(parsed.environment, parsed.account);
                newState.profiles[key] = {setups: parsed.setups};
            }
            return newState;
        }
        return parsed as SetupState;
    } catch {
        return defaultState();
    }
}

export function saveSetupState(state: SetupState): void {
    ensureAuthDir();
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

export function shouldSkipSetup(setupName: string): boolean {
    const envVar = SKIP_ENV_MAP[setupName];
    if (envVar && process.env[envVar] === '1') {
        console.log(`[setup-state] ${setupName}: SKIP detectado por variable ${envVar}=1`);
        return true;
    }

    const state = loadSetupState();
    const currentEnvGroup = detectEnvironmentGroup();
    const currentAccount = detectAccount();
    const profileKey = getProfileKey(currentEnvGroup, currentAccount);

    const profile = state.profiles[profileKey];
    if (!profile || !profile.setups[setupName]) {
        return false;
    }

    const entry = profile.setups[setupName];

    if (entry.completed) {
        console.log(`[setup-state] ${setupName}: ya completado en ${currentEnvGroup} — saltando`);
        return true;
    }

    return false;
}

export function markSetupComplete(setupName: string): void {
    const state = loadSetupState();
    const currentEnvGroup = detectEnvironmentGroup();
    const currentAccount = detectAccount();
    const profileKey = getProfileKey(currentEnvGroup, currentAccount);

    if (!state.profiles[profileKey]) {
        state.profiles[profileKey] = {setups: {}};
    }

    state.profiles[profileKey].setups[setupName] = {
        completed: true,
        timestamp: new Date().toISOString(),
    };
    saveSetupState(state);
    console.log(`[setup-state] ${setupName}: marcado como completado para ${currentEnvGroup}`);
}

export function markSetupIncomplete(setupName: string): void {
    const state = loadSetupState();
    const currentEnvGroup = detectEnvironmentGroup();
    const currentAccount = detectAccount();
    const profileKey = getProfileKey(currentEnvGroup, currentAccount);

    if (state.profiles[profileKey]?.setups[setupName]) {
        delete state.profiles[profileKey].setups[setupName];
        saveSetupState(state);
        console.log(`[setup-state] ${setupName}: marcado como incompleto — se re-ejecutará`);
    }
}

export function forceCompleteAllSetups(): void {
    const state = loadSetupState();
    const currentEnvGroup = detectEnvironmentGroup();
    const currentAccount = detectAccount();
    const profileKey = getProfileKey(currentEnvGroup, currentAccount);

    if (!state.profiles[profileKey]) {
        state.profiles[profileKey] = {setups: {}};
    }

    const timestamp = new Date().toISOString();
    for (const name of SETUP_NAMES) {
        state.profiles[profileKey].setups[name] = {completed: true, timestamp};
    }

    saveSetupState(state);
    console.log(`[setup-state] Todos los setups marcados manualmente como completados para ${currentEnvGroup} / ${currentAccount}`);
}

export function getSetupStateSummary(): string {
    const state = loadSetupState();
    const currentEnv = detectEnvironmentGroup();
    const currentAccount = detectAccount();
    const profileKey = getProfileKey(currentEnv, currentAccount);

    const profile = state.profiles[profileKey] || {setups: {}};

    const lines: string[] = [];
    lines.push(`Ambiente activo: ${currentEnv}`);
    lines.push(`Cuenta activa: ${currentAccount}`);

    lines.push(`  [PuntoVenta]`);
    for (const name of PV_SETUP_NAMES) {
        const entry = profile.setups[name];
        if (entry?.completed) {
            const fecha = new Date(entry.timestamp).toLocaleString('es-PE');
            lines.push(`    ✓ ${name}: completado (${fecha})`);
        } else {
            lines.push(`    ○ ${name}: pendiente`);
        }
    }

    lines.push(`  [Logistica]`);
    for (const name of LOG_SETUP_NAMES) {
        const entry = profile.setups[name];
        if (entry?.completed) {
            const fecha = new Date(entry.timestamp).toLocaleString('es-PE');
            lines.push(`    ✓ ${name}: completado (${fecha})`);
        } else {
            lines.push(`    ○ ${name}: pendiente`);
        }
    }

    return lines.join('\n');
}

export function areAllSetupsComplete(module?: 'pv' | 'logistica'): boolean {
    const state = loadSetupState();
    const currentEnvGroup = detectEnvironmentGroup();
    const currentAccount = detectAccount();
    const profileKey = getProfileKey(currentEnvGroup, currentAccount);

    const profile = state.profiles[profileKey];
    if (!profile) return false;

    const namesToCheck = module === 'pv'
        ? PV_SETUP_NAMES
        : module === 'logistica'
            ? LOG_SETUP_NAMES
            : SETUP_NAMES;

    return namesToCheck.every(name => profile.setups[name]?.completed === true);
}
