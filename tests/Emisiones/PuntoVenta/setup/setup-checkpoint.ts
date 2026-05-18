/**
 * Checkpoint de progreso para el setup de ítems.
 *
 * Si el setup falla a mitad de ejecución (timeout, crash del ERP, etc.),
 * el checkpoint preserva el RUN_ID y la lista de ítems ya creados.
 * En el siguiente reintento se reutiliza el mismo RUN_ID y se saltan
 * los ítems marcados como "done".
 *
 * Archivo: playwright/.auth/setup-checkpoint.json
 */

import {existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync} from 'fs';
import {resolve} from 'path';

// ─── Tipos ─────────────────────────────────────────────────────────────

export interface SetupCheckpoint {
    RUN_ID: string;
    done: string[];
}

// ─── Ruta del archivo ──────────────────────────────────────────────────

const AUTH_DIR = resolve(process.cwd(), 'playwright', '.auth');
const CHECKPOINT_FILE = resolve(AUTH_DIR, 'setup-checkpoint.json');

// ─── API pública ───────────────────────────────────────────────────────

/**
 * Lee el checkpoint existente. Retorna null si no hay uno.
 */
export function cargarCheckpoint(): SetupCheckpoint | null {
    if (!existsSync(CHECKPOINT_FILE)) {
        return null;
    }
    try {
        const contenido = readFileSync(CHECKPOINT_FILE, 'utf-8');
        return JSON.parse(contenido) as SetupCheckpoint;
    } catch {
        return null;
    }
}

/**
 * Crea un nuevo checkpoint con el RUN_ID dado y lista de done vacía.
 */
export function iniciarCheckpoint(runId: string): SetupCheckpoint {
    if (!existsSync(AUTH_DIR)) {
        mkdirSync(AUTH_DIR, {recursive: true});
    }
    const checkpoint: SetupCheckpoint = {RUN_ID: runId, done: []};
    writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2), 'utf-8');
    return checkpoint;
}

/**
 * Marca un ítem como creado exitosamente.
 * Escribe a disco de inmediato para que sobreviva a un crash posterior.
 */
export function marcarDone(key: string): void {
    const checkpoint = cargarCheckpoint();
    if (!checkpoint) {
        throw new Error(`[Checkpoint] No existe checkpoint activo — no se puede marcar "${key}"`);
    }
    if (!checkpoint.done.includes(key)) {
        checkpoint.done.push(key);
        writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2), 'utf-8');
    }
}

/**
 * Elimina el archivo de checkpoint (todo el setup terminó bien).
 */
export function limpiarCheckpoint(): void {
    if (existsSync(CHECKPOINT_FILE)) {
        unlinkSync(CHECKPOINT_FILE);
    }
}
