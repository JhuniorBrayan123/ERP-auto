import fs from 'node:fs';
import path from 'node:path';
import { checkbox } from '@inquirer/prompts';
import { ROOT_DIR } from './config.mjs';
import type { ProjectKey } from './types.mjs';

const { getSetupStateSummary, areAllSetupsComplete, forceCompleteAllSetups, PV_SETUP_NAMES, LOG_SETUP_NAMES } =
    // @ts-ignore - aliased module resolved at runtime by tsx
    await import('@utils/setup-state.js');
const { cargarMapaDesdeCache, guardarMapaEnCache } = await import('../../src/factories/item-factory.js');
const { ITEM_TEMPLATES } = await import('../../src/factories/item-factory.js');
const { markSetupIncomplete } = await import('@utils/setup-state.js');

export function applySetupSelections(selected: string[]): void {
    if (selected.includes('auth') || selected.includes('punto-venta-datos')) {
        delete process.env.SKIP_PV_SETUP;
    } else {
        process.env.SKIP_PV_SETUP = '1';
    }

    if (selected.includes('punto-venta-items')) {
        delete process.env.SKIP_PV_ITEMS_SETUP;
    } else {
        process.env.SKIP_PV_ITEMS_SETUP = '1';
    }

    if (selected.includes('datos-adicionales')) {
        delete process.env.SKIP_DATOS_SETUP;
    } else {
        process.env.SKIP_DATOS_SETUP = '1';
    }
}

function getDefaultSetups(projectKey?: ProjectKey): string[] {
    if (projectKey === 'Emisiones') return [...PV_SETUP_NAMES];
    if (projectKey === 'Logistica') return [...LOG_SETUP_NAMES];
    return [...PV_SETUP_NAMES, ...LOG_SETUP_NAMES];
}

async function cargarCacheActual(): Promise<void> {
    const envGroup = (process.env.APP_ENV ?? '').trim().toLowerCase() === 'prd' ? 'prd' : 'crt-group';
    const currentAccount = (process.env.USER_EMAIL ?? '').trim().toLowerCase() || 'unknown';

    const cacheMapa = cargarMapaDesdeCache(envGroup, currentAccount);

    const checkMissing = async (_mapa: any) => {
        if (envGroup === 'prd') return;
        let needsToRun = false;
        try {
            for (const template of ITEM_TEMPLATES) {
                if (template.fase && !_mapa[template.key]) {
                    console.log(`[setup-state] Ítem faltante detectado por test-runner: ${template.key}. Forzando setup...`);
                    needsToRun = true;
                    break;
                }
            }
        } catch (e) {
            console.warn('[Cache] Error al verificar ITEM_TEMPLATES:', e instanceof Error ? e.message : String(e));
        }
        if (needsToRun) {
            markSetupIncomplete('punto-venta-items');
            delete process.env.SKIP_PV_ITEMS_SETUP;
        }
    };

    if (cacheMapa) {
        console.log(`[Cache] Items cargados desde cache: ${envGroup} / ${currentAccount}`);
        await checkMissing(cacheMapa);
        return;
    }

    const authItemsFile = path.join(ROOT_DIR, 'playwright', '.auth', 'dynamic-items.json');

    if (envGroup === 'prd') {
        const prdItemsFile = path.join(ROOT_DIR, 'playwright', 'dynamic-items.prd.json');
        try {
            const prdContent = fs.readFileSync(prdItemsFile, 'utf-8');
            const prdMapa = JSON.parse(prdContent);
            if (!fs.existsSync(path.dirname(authItemsFile))) {
                fs.mkdirSync(path.dirname(authItemsFile), { recursive: true });
            }
            fs.writeFileSync(authItemsFile, JSON.stringify(prdMapa, null, 2), 'utf-8');
            guardarMapaEnCache(prdMapa, envGroup, currentAccount);
            console.log(`[Cache] PRD seed copiado a cache: ${envGroup} / ${currentAccount}`);
        } catch {
            console.warn('[PRD] No se pudo cargar dynamic-items.prd.json — ¿existe el archivo?');
        }
        return;
    }

    try {
        if (fs.existsSync(authItemsFile)) {
            const crtContent = fs.readFileSync(authItemsFile, 'utf-8');
            const crtMapa = JSON.parse(crtContent);
            guardarMapaEnCache(crtMapa, envGroup, currentAccount);
            console.log(`[Cache] CRT cache creado desde dynamic-items.json (RUN_ID: ${crtMapa.RUN_ID})`);
            await checkMissing(crtMapa);
        } else {
            console.warn(`[Cache] No hay cache para ${envGroup} / ${currentAccount}. ` +
                `Ejecuta setups o copia tus códigos a playwright/.auth/dynamic-items.json`);
        }
    } catch {
        console.warn('[Cache] dynamic-items.json inválido — revisa el formato del archivo');
    }
}

export async function askRunOptions(projectKey?: ProjectKey): Promise<string[]> {
    const stateSummary = getSetupStateSummary();
    console.log('\n──────────────────────────────────────');
    console.log('Estado de setups:');
    console.log(stateSummary);
    console.log('──────────────────────────────────────\n');

    if (areAllSetupsComplete()) {
        console.log('[setup-state] Todos los setups completados — saltando ejecución de setups\n');
        process.env.SKIP_PV_ITEMS_SETUP = '1';
        process.env.SKIP_DATOS_SETUP = '1';
        await cargarCacheActual();
        return [];
    }

    const defaults = getDefaultSetups(projectKey);

    const CONFIG_NAME = { name: '─'.repeat(30), value: '__SEPARATOR__' } as const;
    const ALL_VALUE = '__SELECT_ALL__';
    const NONE_VALUE = '__SELECT_NONE__';
    const FORCE_COMPLETE_VALUE = '__FORCE_COMPLETE__';

    const rawSelection = await checkbox<string>({
        message: `Selecciona los setups a ejecutar:\n` +
            `(Usa ESPACIO para marcar/desmarcar, ENTER para confirmar)`,
        pageSize: 10,
        loop: false,
        choices: [
            { name: '🔐 auth', value: 'auth', checked: defaults.includes('auth') },
            { name: '📦 pv-datos', value: 'punto-venta-datos', checked: defaults.includes('punto-venta-datos') },
            { name: '📦 pv-items', value: 'punto-venta-items', checked: defaults.includes('punto-venta-items') },
            { name: '📋 datos-adicionales', value: 'datos-adicionales', checked: defaults.includes('datos-adicionales') },
            { name: CONFIG_NAME.name, value: CONFIG_NAME.value, disabled: true },
            { name: '✓ Seleccionar todos', value: ALL_VALUE },
            { name: '○ Deseleccionar todos', value: NONE_VALUE },
            { name: '>> Marcar todos como completados (saltar y guardar estado)', value: FORCE_COMPLETE_VALUE },
        ],
    });

    let selected: string[];
    if (rawSelection.includes(FORCE_COMPLETE_VALUE)) {
        console.log(`\n[setup-state] Bypass manual invocado. Marcando todos los setups como completados...`);
        forceCompleteAllSetups();
        process.env.SKIP_PV_ITEMS_SETUP = '1';
        process.env.SKIP_DATOS_SETUP = '1';
        process.env.SKIP_PV_SETUP = '1';
        await cargarCacheActual();
        return [];
    } else if (rawSelection.includes(ALL_VALUE)) {
        selected = ['auth', 'punto-venta-datos', 'punto-venta-items', 'datos-adicionales'];
    } else if (rawSelection.includes(NONE_VALUE)) {
        selected = [];
    } else {
        selected = rawSelection.filter(v => v !== '__SEPARATOR__');
    }

    console.log(`\n[setup-selection] Setups seleccionados: ${selected.length > 0 ? selected.join(', ') : '(ninguno)'}`);
    applySetupSelections(selected);
    await cargarCacheActual();
    return [];
}
