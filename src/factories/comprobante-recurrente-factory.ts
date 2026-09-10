import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {generarSlugCache} from './item-factory';

export type TipoSeed = 'BOLETA' | 'FACTURA';

export type ClaveSeed = 'boleta' | 'factura';

export interface SeedComprobante {
    serie: string;
    correlativo: string;
    comprobanteId: number;
    numero: string;
    vinculado: boolean;
    emitidoEn: string;
}

export type SeedsCache = Partial<Record<ClaveSeed, SeedComprobante>>;

const AUTH_DIR = resolve(process.cwd(), 'playwright', '.auth');
const SEEDS_CACHE_DIR = resolve(AUTH_DIR, 'cache');

export function claveDeSeed(tipo: TipoSeed): ClaveSeed {
    return tipo.toLowerCase() as ClaveSeed;
}

// `seed-comprobantes.` prefix keeps this file distinct from item-factory's
// `<slug>.json` item cache in the same directory — same slug rules, but a
// shared filename would silently clobber the item cache on write.
export function rutaCacheSeeds(envGroup: string, account: string): string {
    return resolve(SEEDS_CACHE_DIR, `seed-comprobantes.${generarSlugCache(envGroup, account)}.json`);
}

export function cargarSeeds(envGroup: string, account: string): SeedsCache | null {
    const cacheFile = rutaCacheSeeds(envGroup, account);
    if (!existsSync(cacheFile)) {
        return null;
    }
    try {
        const contenido = readFileSync(cacheFile, 'utf-8');
        return JSON.parse(contenido) as SeedsCache;
    } catch {
        return null;
    }
}

export function guardarSeeds(cache: SeedsCache, envGroup: string, account: string): void {
    if (!existsSync(SEEDS_CACHE_DIR)) {
        mkdirSync(SEEDS_CACHE_DIR, {recursive: true});
    }
    const cacheFile = rutaCacheSeeds(envGroup, account);
    writeFileSync(cacheFile, JSON.stringify(cache, null, 2), 'utf-8');
}

let reclamos = new Set<TipoSeed>();

export function reclamosEnProceso(): TipoSeed[] {
    return [...reclamos];
}

// Called from the fixture's `beforeEach` — this in-process Set is only safe
// because `PuntoVentaNotas` is a hard `workers: 1` project (no cross-worker state).
export function limpiarReclamos(): void {
    reclamos = new Set<TipoSeed>();
}

// Marks vinculado:true at claim time, before the test uses the seed — not
// after NC/ND creation. A crash between claim and cleanup then self-heals:
// the next run sees vinculado:true and emits a fresh replacement seed.
export function reclamarSeed(tipo: TipoSeed, envGroup: string, account: string): void {
    const clave = claveDeSeed(tipo);
    const cache = cargarSeeds(envGroup, account) ?? {};
    const entrada = cache[clave];
    if (!entrada) {
        return;
    }
    cache[clave] = {...entrada, vinculado: true};
    guardarSeeds(cache, envGroup, account);
    reclamos.add(tipo);
}

export function liberarSeed(tipo: TipoSeed, envGroup: string, account: string): void {
    const clave = claveDeSeed(tipo);
    const cache = cargarSeeds(envGroup, account) ?? {};
    const entrada = cache[clave];
    if (!entrada) {
        return;
    }
    cache[clave] = {...entrada, vinculado: false};
    guardarSeeds(cache, envGroup, account);
}

export interface DatosSeedNuevo {
    serie: string;
    correlativo: string;
    comprobanteId: number;
    numero: string;
}

export function registrarSeedNuevo(
    tipo: TipoSeed,
    resultado: DatosSeedNuevo,
    envGroup: string,
    account: string,
): void {
    const clave = claveDeSeed(tipo);
    const cache = cargarSeeds(envGroup, account) ?? {};
    cache[clave] = {
        serie: resultado.serie,
        correlativo: resultado.correlativo,
        comprobanteId: resultado.comprobanteId,
        numero: resultado.numero,
        vinculado: true,
        emitidoEn: new Date().toISOString(),
    };
    guardarSeeds(cache, envGroup, account);
    reclamos.add(tipo);
}
