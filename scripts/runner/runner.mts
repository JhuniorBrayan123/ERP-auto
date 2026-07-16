import type { ChildProcess } from 'node:child_process';
import { spawn as nodeSpawn } from 'node:child_process';
import crossSpawn from 'cross-spawn';
import type { ProjectContext } from './types.mjs';
import { PROJECT_CONFIG, ensureOutputDirs } from './config.mjs';

let currentChildren: ChildProcess[] = [];

export function killCurrentChildren(): void {
    if (currentChildren.length === 0) return;

    console.log('\nDeteniendo ejecucion de Playwright...\n');

    for (const child of currentChildren) {
        if (!child?.pid) continue;

        if (process.platform === 'win32') {
            nodeSpawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
                stdio: 'ignore',
                shell: false,
            });
        } else {
            child.kill('SIGTERM');
        }
    }

    currentChildren = [];
}

process.on('SIGINT', () => {
    killCurrentChildren();
    process.exit(130);
});

process.on('SIGTERM', () => {
    killCurrentChildren();
    process.exit(143);
});

export function buildArgs(projectContext: ProjectContext, extraArgs: string[], pathsToRun: string[]): string[] {
    const args: string[] = [];

    let currentProjectFlag = projectContext.projectFlag;
    let currentOutputDir = projectContext.outputDir;

    if (projectContext.key === 'Emisiones') {
        const includesFacturacion = (p: string) => p.includes('/Facturacion') || p.includes('\\Facturacion');
        const allAreFacturacion = pathsToRun.length > 0 && pathsToRun.every(includesFacturacion);
        if (allAreFacturacion) {
            currentProjectFlag = 'Facturacion';
            currentOutputDir = 'test-results/facturacion';
        }
    }

    if (currentProjectFlag) {
        args.push('--project', currentProjectFlag);
    }
    args.push('--output', currentOutputDir);
    if (!projectContext.isRunAll) {
        args.push('--workers', '1');
    }
    return [...args, ...extraArgs];
}

export function formatCommandWithContext(args: string[], projectContext?: ProjectContext): string {
    const prefixArgs = projectContext ? buildArgs(projectContext, [], args) : [];
    return ['npx', 'playwright', 'test', ...prefixArgs, ...args]
        .map(a => /[\s|&<>^()]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a)
        .join(' ');
}

export function runPlaywright(args: string[], projectContext?: ProjectContext): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const ctx = projectContext || { key: 'Emisiones', projectFlag: 'PuntoVenta', testDir: '', outputDir: 'test-results/puntoventa', isRunAll: false } as ProjectContext;
        const prefixedArgs = buildArgs(ctx, args, args);

        console.log('\nComando generado:\n');
        console.log(formatCommandWithContext(args, ctx));
        console.log('');

        const childEnv: NodeJS.ProcessEnv = {
            ...process.env,
            PW_REPORT_OUTPUT: `${ctx.outputDir}/results.json`,
            PW_JUNIT_OUTPUT: `${ctx.outputDir}/junit.xml`,
            PW_HTML_OUTPUT: `playwright-report/${ctx.key.toLowerCase()}`,
        };

        ensureOutputDirs(ctx.outputDir);
        ensureOutputDirs(`playwright-report/${ctx.key.toLowerCase()}`);

        const child = crossSpawn('npx', ['playwright', 'test', ...prefixedArgs], {
            stdio: 'inherit',
            shell: false,
            env: childEnv,
        });

        currentChildren.push(child);

        child.on('error', (error) => {
            currentChildren = currentChildren.filter(c => c !== child);
            reject(error);
        });

        child.on('close', (_code) => {
            currentChildren = currentChildren.filter(c => c !== child);
            console.log(`\nEjecucion finalizada con codigo: ${_code}\n`);
            resolve([ctx.outputDir]);
        });
    });
}

export function spawnSuite(
    args: string[],
    env: NodeJS.ProcessEnv,
    prefix: string,
): Promise<{ code: number | null; outputDir: string }> {
    return new Promise((resolve) => {
        const child = crossSpawn('npx', ['playwright', 'test', ...args], {
            stdio: 'pipe',
            shell: false,
            env,
        });
        currentChildren.push(child);

        if (child.stdout) {
            child.stdout.on('data', (data: Buffer | string) => {
                const lines = data.toString().split('\n');
                for (const line of lines) {
                    const t = line.trim();
                    if (t && !t.startsWith('-> Ejecutando:')
                        && !t.startsWith('[dotenv@')
                        && !t.includes('Códigos dinámicos activos')
                        && !t.includes('agentic secret storage')
                        && !t.includes('prevent committing')
                        && !t.startsWith('Running setup')
                        && !t.startsWith('Entorno:')) {
                        process.stdout.write(`${prefix} ${t}\n`);
                    }
                }
            });
        }
        if (child.stderr) {
            child.stderr.on('data', (data: Buffer | string) => {
                for (const line of data.toString().split('\n')) {
                    const t = line.trim();
                    if (t) process.stdout.write(`${prefix} ${t}\n`);
                }
            });
        }

        child.on('close', (code) => {
            currentChildren = currentChildren.filter(c => c !== child);
            const outputDir = (env.PW_REPORT_OUTPUT as string || '').replace('/results.json', '');
            resolve({ code, outputDir });
        });
    });
}
