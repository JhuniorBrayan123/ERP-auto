import fs from 'node:fs';
import path from 'node:path';
import Fuse from 'fuse.js';
import type { ExplorerEntry, TestCase, EntryType } from './types.mjs';
import { ROOT_DIR } from './config.mjs';

export function exists(targetPath: string): boolean {
    return fs.existsSync(targetPath);
}

export function isDirectory(targetPath: string): boolean {
    return exists(targetPath) && fs.statSync(targetPath).isDirectory();
}

export function isSpecFile(targetPath: string): boolean {
    return exists(targetPath) && fs.statSync(targetPath).isFile() && targetPath.endsWith('.spec.ts');
}

export function toRelative(targetPath: string): string {
    return path.relative(ROOT_DIR, targetPath).replace(/\\/g, '/');
}

export function listEntries(currentDir: string): ExplorerEntry[] {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    const folders: ExplorerEntry[] = entries
        .filter((entry) => entry.isDirectory())
        .map((entry): ExplorerEntry => ({
            name: entry.name,
            path: path.join(currentDir, entry.name),
            type: 'folder' as EntryType,
        }))
        .sort((a, b) => a.name.localeCompare(b.name, 'es'));

    const files: ExplorerEntry[] = entries
        .filter((entry) => entry.isFile() && entry.name.endsWith('.spec.ts'))
        .map((entry): ExplorerEntry => ({
            name: entry.name,
            path: path.join(currentDir, entry.name),
            type: 'file' as EntryType,
        }))
        .sort((a, b) => a.name.localeCompare(b.name, 'es'));

    return [...folders, ...files];
}

export function walkSpecFiles(dir: string, result: string[] = []): string[] {
    if (!isDirectory(dir)) return result;

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            walkSpecFiles(fullPath, result);
        }

        if (entry.isFile() && entry.name.endsWith('.spec.ts')) {
            result.push(fullPath);
        }
    }

    return result;
}

export function extractTestsFromFile(filePath: string): TestCase[] {
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = /(?:^|\n)\s*test(?:\.(?:only|skip|fixme))?\s*\(\s*['"`]([^'"`]+)['"`]/g;
    const tagRegex = /@[\w.-]+/g;
    const tests: TestCase[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
        const title = match[1];
        const tags = title.match(tagRegex) ?? undefined;
        tests.push({ title, filePath, tags });
    }

    return tests;
}

export function escapeGrep(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function quoteArg(arg: string): string {
    if (!arg.trim()) return '""';
    if (/[\s|&<>^()]/.test(arg)) {
        return `"${arg.replace(/"/g, '\\"')}"`;
    }
    return arg;
}

export function normalizeText(text: string): string {
    return text.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

export function tokenMatch(query: string, target: string): boolean {
    const tokens = query.trim().toLowerCase().split(/\s+/);
    const normalized = normalizeText(target);
    return tokens.every(token => normalized.includes(token));
}

let _fuseInstance: Fuse<TestCase> | null = null;

export function getFuseInstance(tests: TestCase[]): Fuse<TestCase> {
    if (!_fuseInstance) {
        _fuseInstance = new Fuse(tests, {
            keys: ['title'],
            threshold: 0.4,
            includeScore: true,
        });
    }
    return _fuseInstance;
}

export function formatCommand(args: string[]): string {
    return ['npx', 'playwright', 'test', ...args].map(quoteArg).join(' ');
}

/**
 * Resuelve módulo (1er nivel) y submódulo (2do nivel) desde ruta absoluta de archivo .spec.ts.
 *
 * Ejemplos:
 *   tests/Emisiones/PuntoVenta/Boleta/PV-01_foo.spec.ts
 *     → { module: 'PuntoVenta', submodule: 'Boleta' }
 *   tests/Emisiones/Facturacion/Boleta/FC-01_foo.spec.ts
 *     → { module: 'Facturacion', submodule: 'Boleta' }
 *   tests/Logistica/Movimientos/MS-1_ingreso/foo.spec.ts
 *     → { module: 'Logistica', submodule: 'Movimientos' }
 */
export function resolveModuleAndSubmodule(filePath: string): { module: string; submodule: string | null } {
    const rel = toRelative(filePath);
    const parts = rel.split('/');
    const testsIdx = parts.indexOf('tests');
    if (testsIdx === -1 || parts.length < testsIdx + 3) {
        return { module: 'unknown', submodule: null };
    }
    const root = parts[testsIdx + 1]; // Emisiones or Logistica
    const mod = parts[testsIdx + 2];  // PuntoVenta, Facturacion, etc.

    if (root === 'Logistica') {
        return { module: 'Logistica', submodule: mod };
    }

    if (mod === 'Facturacion' && parts.length >= testsIdx + 4) {
        return { module: 'Facturacion', submodule: parts[testsIdx + 3] };
    }

    if (['PuntoVenta', 'Busqueda', 'CierreCaja'].includes(mod)) {
        const sub = parts.length >= testsIdx + 4 ? parts[testsIdx + 3] : null;
        return { module: mod, submodule: sub };
    }

    return { module: mod, submodule: null };
}
