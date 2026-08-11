import {existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync} from 'fs';
import {resolve} from 'path';

export interface SetupCheckpoint {
    RUN_ID: string;
    done: string[];
}

const AUTH_DIR = resolve(process.cwd(), 'playwright', '.auth');
const CHECKPOINT_FILE = resolve(AUTH_DIR, 'setup-checkpoint.json');

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

export function iniciarCheckpoint(runId: string): SetupCheckpoint {
    if (!existsSync(AUTH_DIR)) {
        mkdirSync(AUTH_DIR, {recursive: true});
    }
    const checkpoint: SetupCheckpoint = {RUN_ID: runId, done: []};
    writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2), 'utf-8');
    return checkpoint;
}

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

export function limpiarCheckpoint(): void {
    if (existsSync(CHECKPOINT_FILE)) {
        unlinkSync(CHECKPOINT_FILE);
    }
}
