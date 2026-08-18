import {strict as assert} from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

let passed = 0;
let failed = 0;

async function it(name: string, fn: () => Promise<void> | void): Promise<void> {
    try {
        await fn();
        passed++;
        console.log(`  ✓ ${name}`);
    } catch (e) {
        failed++;
        const msg = (e as Error).message.split('\n')[0];
        console.log(`  ✗ ${name} — ${msg}`);
    }
}

const ROOT = path.resolve(__dirname, '..', '..');
const PARTIALS_DIR = path.join(ROOT, 'test-results', '.discord-partials');




interface QaFailureShape {
    caseName: string;
    failedStep: string;
    userMessage: string;
    failureCategory: string;
}
interface DiscordPartialShape {
    project: string;
    module: string;
    started: number;
    passed: number;
    failed: number;
    errors: number;
    skipped: number;
    durationMs: number;
    qaFailures: QaFailureShape[];
    htmlLink: string;
}
interface ConsolidatedPayloadShape {
    environment: string;
    tester: string;
    startedAt: string;
    durationMs: number;
    modules: DiscordPartialShape[];
    total: {passed: number; failed: number; errors: number; skipped: number};
    failures: QaFailureShape[];
    commit?: string;
    branch?: string;
    htmlLinks: string[];
    missing: string[];
}
interface ReporterModuleShape {
    default: new () => {onTestEnd: (test: unknown, result: unknown) => void; onEnd: (result: unknown) => Promise<void>};
    extractModuleFromFile: (file: string) => string;
    projectKeyFromReportOutput: (output: string | undefined) => string | undefined;
    formatDiscordMessage: (p: ConsolidatedPayloadShape, mentions?: {userId?: string}) => string;
    mergePartials: (partials: DiscordPartialShape[], missing: string[]) => ConsolidatedPayloadShape;
    postToDiscord: (content: string, opts: {webhookUrl: string; dryRun: boolean}) => Promise<void>;
    loadPartialsFromDisk: (dir: string, expectedProjects: string[]) => {partials: DiscordPartialShape[]; missing: string[]};
    DISCORD_MAX_LENGTH: number;
}

const DISCORD_VARS = [
    'DISCORD_REPORT_ENABLED',
    'DISCORD_WEBHOOK_URL',
    'DISCORD_TESTER_NAME',
    'DISCORD_USER_ID',
    'DISCORD_ONLY_FAILURES',
    'DISCORD_DRY_RUN',
] as const;

const PW_VARS = ['PW_DISCORD_MODE', 'PW_DISCORD_PROJECT', 'PW_REPORT_OUTPUT', 'PW_HTML_OUTPUT'] as const;

function ensureBaseEnv(): void {
    if (!process.env.APP_ENV) process.env.APP_ENV = 'prd';
    if (!process.env.USER_EMAIL) process.env.USER_EMAIL = 'test@test.com';
    if (!process.env.USER_PASSWORD) process.env.USER_PASSWORD = 'test-pass';
}

function clearDiscordVars(): void {
    for (const v of DISCORD_VARS) delete process.env[v];
}

function clearPwVars(): void {
    for (const v of PW_VARS) delete process.env[v];
}

function requireReporterModule(): ReporterModuleShape {
    const envResolved = require.resolve('../../config/env');
    const modResolved = require.resolve('../../src/utils/discord-reporter');
    delete require.cache[envResolved];
    delete require.cache[modResolved];
    
    return require(modResolved) as unknown as ReporterModuleShape;
}

function mockFetch(behavior?: (url: string, init?: any) => Promise<unknown> | unknown): {
    calls: Array<{url: string; init?: any}>;
    restore: () => void;
} {
    const calls: Array<{url: string; init?: any}> = [];
    const origFetch = (globalThis as any).fetch;
    (globalThis as any).fetch = async (url: string, init?: any) => {
        calls.push({url, init});
        if (behavior) return await behavior(url, init);
        throw new Error('fetch no debe llamarse (red simulada)');
    };
    return {
        calls,
        restore: () => {
            (globalThis as any).fetch = origFetch;
        },
    };
}


function fakeTest(overrides: Record<string, unknown> = {}): any {
    return {
        id: 'test-1',
        title: 'Flujo completo de boleta',
        retries: 1,
        results: [],
        tags: [],
        location: {file: 'tests/Emisiones/PuntoVenta/Boleta/boleta.spec.ts'},
        ...overrides,
    };
}

function fakeResult(overrides: Record<string, unknown> = {}): any {
    return {
        status: 'passed',
        retry: 0,
        duration: 1500,
        error: undefined,
        steps: [],
        ...overrides,
    };
}

function makePartial(overrides: Partial<DiscordPartialShape> = {}): DiscordPartialShape {
    return {
        project: 'PuntoVenta',
        module: 'PuntoVenta',
        started: 1000,
        passed: 5,
        failed: 1,
        errors: 0,
        skipped: 1,
        durationMs: 120_000,
        qaFailures: [],
        htmlLink: 'report/html/puntoventa',
        ...overrides,
    };
}

function makePayload(overrides: Partial<ConsolidatedPayloadShape> = {}): ConsolidatedPayloadShape {
    return {
        environment: 'CRT-1',
        tester: 'Ana',
        startedAt: new Date(1000).toISOString(),
        durationMs: 240_000,
        modules: [makePartial()],
        total: {passed: 5, failed: 1, errors: 0, skipped: 1},
        failures: [],
        commit: 'abc1234',
        branch: 'feature-18744v6',
        htmlLinks: ['report/html/puntoventa'],
        missing: [],
        ...overrides,
    };
}

function makeFailure(i: number): QaFailureShape {
    const category = i % 2 === 0 ? 'SCRIPT' : 'DATOS';
    return {
        caseName: `Caso funcional ${i}`,
        failedStep: `Paso número ${i}`,
        userMessage: `Motivo detallado del caso ${i} con texto suficiente para llenar el presupuesto del mensaje`,
        failureCategory: category,
    };
}

async function main(): Promise<void> {
    console.log('\n=== src/utils/discord-reporter.ts — reporter Discord env-config — Unit Tests ===\n');

    ensureBaseEnv();

    
    console.log('  ── extractModuleFromFile (módulo desde spec path) ──');

    const mod = requireReporterModule();

    await it('extractModuleFromFile: tests/Emisiones/PuntoVenta/Boleta → PuntoVenta/Boleta', () => {
        assert.strictEqual(mod.extractModuleFromFile('tests/Emisiones/PuntoVenta/Boleta/boleta.spec.ts'), 'PuntoVenta/Boleta');
    });

    await it('extractModuleFromFile: Emisiones/Facturacion prioridad + subcarpeta (cotizacion → Cotizacion)', () => {
        assert.strictEqual(mod.extractModuleFromFile('tests/Emisiones/Facturacion/Factura/factura.spec.ts'), 'Facturacion/Factura');
        assert.strictEqual(mod.extractModuleFromFile('tests/Emisiones/Facturacion/cotizacion/FC-CT-emision.spec.ts'), 'Facturacion/Cotizacion');
    });

    await it('extractModuleFromFile: tests/Logistica → Logistica + subcarpeta', () => {
        assert.strictEqual(mod.extractModuleFromFile('tests/Logistica/Movimientos/movimiento.spec.ts'), 'Logistica/Movimientos');
    });

    await it('extractModuleFromFile: tests/ClientesProveedores → Clientes + subcarpeta', () => {
        assert.strictEqual(mod.extractModuleFromFile('tests/ClientesProveedores/proveedores/proveedor.spec.ts'), 'Clientes/Proveedores');
    });

    await it('extractModuleFromFile: rutas Windows (backslash) normalizadas', () => {
        assert.strictEqual(mod.extractModuleFromFile('tests\\Emisiones\\Facturacion\\Factura\\factura.spec.ts'), 'Facturacion/Factura');
        assert.strictEqual(mod.extractModuleFromFile('tests\\Logistica\\Movimientos\\movimiento.spec.ts'), 'Logistica/Movimientos');
    });

    await it('extractModuleFromFile: nombre de carpeta PascalCase (guiones/bajos)', () => {
        assert.strictEqual(
            mod.extractModuleFromFile('tests/Emisiones/PuntoVenta/notas-debito/emision-nota-debito-intereses.spec.ts'),
            'PuntoVenta/NotasDebito',
        );
        assert.strictEqual(
            mod.extractModuleFromFile('tests/Emisiones/PuntoVenta/Boleta/PV-01_emision-stock-datos-adicionales/pv-01-boleta-stock.spec.ts'),
            'PuntoVenta/Boleta/PV01EmisionStockDatosAdicionales',
        );
    });

    await it('extractModuleFromFile: subcarpeta Emisiones sin PuntoVenta (CierreCaja) → CierreCaja', () => {
        assert.strictEqual(mod.extractModuleFromFile('tests/Emisiones/CierreCaja/caja/cierre.spec.ts'), 'CierreCaja/Caja');
    });

    await it('extractModuleFromFile: path desconocido → Otros', () => {
        assert.strictEqual(mod.extractModuleFromFile('tests/OtrosArea/raro.spec.ts'), 'Otros');
    });

    console.log('  ── projectKeyFromReportOutput (fallback de proyecto) ──');

    await it('projectKeyFromReportOutput: test-results/puntoventa/results.json → PuntoVenta', () => {
        assert.strictEqual(mod.projectKeyFromReportOutput('test-results/puntoventa/results.json'), 'PuntoVenta');
    });

    await it('projectKeyFromReportOutput: undefined o sin patrón → undefined', () => {
        assert.strictEqual(mod.projectKeyFromReportOutput(undefined), undefined);
        assert.strictEqual(mod.projectKeyFromReportOutput('report/html'), undefined);
    });

    
    console.log('  ── formatDiscordMessage (≤2000 chars, módulos, fallos, menciones) ──');

    await it('formatDiscordMessage: corrida verde → EXITOSO y mención SIEMPRE presente (userId configurado)', () => {
        const msg = mod.formatDiscordMessage(
            makePayload({failures: [], total: {passed: 6, failed: 0, errors: 0, skipped: 0}}),
            {userId: '<@123>'},
        );
        assert.ok(msg.includes('✅ **EXITOSO**'), 'debe marcar EXITOSO');
        assert.ok(!msg.includes('TOP FALLOS'), 'no debe listar fallos');
        assert.ok(msg.includes('<@123>'), 'verde: debe mencionar al ejecutor SIEMPRE (userId configurado)');
        assert.ok(!msg.includes('<@&'), 'nunca debe mencionar un rol');
    });

    await it('formatDiscordMessage: sin userId → sin mención (degrada sin error)', () => {
        const greenMsg = mod.formatDiscordMessage(
            makePayload({failures: [], total: {passed: 6, failed: 0, errors: 0, skipped: 0}}),
        );
        const failMsg = mod.formatDiscordMessage(makePayload({failures: [makeFailure(0)]}));
        assert.ok(!greenMsg.includes('<@'), 'verde sin userId: no hay mención');
        assert.ok(!failMsg.includes('<@'), 'fallido sin userId: no hay mención');
        assert.ok(greenMsg.includes('✅ **EXITOSO**'), 'verde sigue formateándose');
        assert.ok(failMsg.includes('❌ **FALLIDO**'), 'fallido sigue formateándose');
    });

    await it('formatDiscordMessage: con fallos → FALLIDO, mención del ejecutor y detalle funcional', () => {
        const failures: QaFailureShape[] = [
            {caseName: 'Emitir boleta', failedStep: 'Confirmar emisión', userMessage: 'El botón no quedó visible', failureCategory: 'SCRIPT'},
        ];
        const msg = mod.formatDiscordMessage(makePayload({failures}), {userId: '<@123>'});
        assert.ok(msg.includes('❌ **FALLIDO**'), 'debe marcar FALLIDO');
        assert.ok(msg.includes('TOP FALLOS'), 'debe listar fallos');
        assert.ok(msg.includes('<@123>'), 'debe mencionar al usuario');
        assert.ok(!msg.includes('<@&'), 'no debe mencionar ningún rol');
        assert.ok(msg.includes('[SCRIPT] Emitir boleta'), 'debe incluir categoría y caso');
        assert.ok(msg.includes('Confirmar emisión'), 'debe incluir el paso que falló');
        assert.ok(msg.includes('El botón no quedó visible'), 'debe incluir el motivo');
        assert.ok(msg.includes('npx playwright show-report'), 'debe incluir el hint del reporte HTML');
    });

    await it('formatDiscordMessage: truncado con 60 fallos → ≤2000 chars y cola "… +N más"', () => {
        const failures = Array.from({length: 60}, (_, i) => makeFailure(i));
        const msg = mod.formatDiscordMessage(makePayload({failures}));
        assert.ok(msg.length <= mod.DISCORD_MAX_LENGTH, `longitud ${msg.length} excede ${mod.DISCORD_MAX_LENGTH}`);
        assert.match(msg, /… \+(\d+) más/, 'debe truncar con cola … +N más');
        const first = makeFailure(0);
        assert.ok(msg.includes(first.caseName), 'el primer fallo debe conservarse');
    });

    await it('formatDiscordMessage: desglose por módulo con conteos', () => {
        const msg = mod.formatDiscordMessage(makePayload({
            modules: [
                makePartial({project: 'PuntoVenta', module: 'PuntoVenta', passed: 10, failed: 2, errors: 0, skipped: 1}),
                makePartial({project: 'Facturacion', module: 'Facturacion', passed: 4, failed: 0, errors: 0, skipped: 0}),
            ],
            total: {passed: 14, failed: 2, errors: 0, skipped: 1},
        }));
        assert.ok(msg.includes('**PuntoVenta**'), 'fila PuntoVenta');
        assert.ok(msg.includes('10 pasaron, 2 fallaron'), 'conteos de PuntoVenta');
        assert.ok(msg.includes('**Facturacion**'), 'fila Facturacion');
        assert.ok(msg.includes('4 pasaron'), 'conteos de Facturacion');
        assert.ok(!msg.includes('0 fallaron'), 'no imprime conteos en cero (formato compacto)');
    });

    await it('formatDiscordMessage: metadata entorno/tester/fecha/duración', () => {
        const msg = mod.formatDiscordMessage(makePayload());
        assert.ok(msg.includes('CRT-1'), 'entorno');
        assert.ok(msg.includes('Ana'), 'tester');
        assert.ok(msg.includes('📅 **Fecha de ejecución:**'), 'fecha de ejecución presente');
        assert.ok(msg.includes('4 min 0 sec'), 'duración formateada');
    });

    await it('formatDiscordMessage: hint del reporte HTML solo cuando hay fallos', () => {
        const failMsg = mod.formatDiscordMessage(makePayload({failures: [makeFailure(0)]}));
        const greenMsg = mod.formatDiscordMessage(
            makePayload({failures: [], total: {passed: 6, failed: 0, errors: 0, skipped: 0}}),
        );
        assert.ok(failMsg.includes('npx playwright show-report'), 'con fallos: hint HTML presente');
        assert.ok(failMsg.includes('Para ver los detalles de los fallos'), 'con fallos: texto del hint');
        assert.ok(!greenMsg.includes('show-report'), 'verde: sin hint HTML');
    });

    
    console.log('  ── mergePartials (consolidación de parciales) ──');

    await it('mergePartials: 2 parciales → totales sumados, fallos concatenados, links y missing', () => {
        const merged = mod.mergePartials([
            makePartial({
                project: 'PuntoVenta', module: 'PuntoVenta', started: 5000,
                passed: 5, failed: 1, errors: 1, skipped: 2, durationMs: 60_000,
                qaFailures: [{caseName: 'A', failedStep: 'P', userMessage: 'M', failureCategory: 'SCRIPT'}],
                htmlLink: 'report/html/puntoventa',
            }),
            makePartial({
                project: 'Logistica', module: 'Logistica', started: 90_000,
                passed: 3, failed: 2, errors: 0, skipped: 0, durationMs: 45_000,
                qaFailures: [{caseName: 'B', failedStep: 'Q', userMessage: 'N', failureCategory: 'DATOS'}],
                htmlLink: 'report/html/logistica',
            }),
        ], ['Clientes']);
        assert.deepStrictEqual(merged.total, {passed: 8, failed: 3, errors: 1, skipped: 2});
        assert.strictEqual(merged.failures.length, 2, 'fallos concatenados');
        assert.strictEqual(merged.failures[1].caseName, 'B');
        assert.deepStrictEqual(merged.htmlLinks, ['report/html/puntoventa', 'report/html/logistica']);
        assert.deepStrictEqual(merged.missing, ['Clientes']);
        assert.strictEqual(merged.modules.length, 2);
        assert.strictEqual(merged.durationMs, 105_000, 'duración = suma de parciales');
        assert.strictEqual(merged.startedAt, new Date(5000).toISOString(), 'startedAt = parcial más temprano');
    });

    await it('mergePartials: sin parciales → ceros, arrays vacíos, missing conservado', () => {
        const merged = mod.mergePartials([], ['PuntoVenta', 'Facturacion']);
        assert.deepStrictEqual(merged.total, {passed: 0, failed: 0, errors: 0, skipped: 0});
        assert.deepStrictEqual(merged.failures, []);
        assert.deepStrictEqual(merged.modules, []);
        assert.deepStrictEqual(merged.missing, ['PuntoVenta', 'Facturacion']);
    });

    await it('mergePartials: environment/tester desde env', () => {
        clearDiscordVars();
        process.env.ENV_NAME = 'crt-3';
        process.env.DISCORD_TESTER_NAME = 'Ana';
        const m = requireReporterModule();
        const merged = m.mergePartials([makePartial()], []);
        assert.strictEqual(merged.environment, 'CRT-3');
        assert.strictEqual(merged.tester, 'Ana');
        delete process.env.ENV_NAME;
    });

    
    console.log('  ── loadPartialsFromDisk (lectura de parciales: faltantes/corruptos) ──');

    const tmpPartialsDir = path.join(ROOT, 'test-results', '.discord-partials-test');
    function writePartialFile(project: string, content: string): void {
        fs.mkdirSync(tmpPartialsDir, {recursive: true});
        fs.writeFileSync(path.join(tmpPartialsDir, `${project}.json`), content, 'utf8');
    }
    function cleanupTmpPartials(): void {
        if (fs.existsSync(tmpPartialsDir)) {
            fs.rmSync(tmpPartialsDir, {recursive: true, force: true});
        }
    }

    await it('loadPartialsFromDisk: 2 parciales válidos → cargados, missing vacío', () => {
        cleanupTmpPartials();
        writePartialFile('PuntoVenta', JSON.stringify(makePartial({project: 'PuntoVenta'})));
        writePartialFile('Logistica', JSON.stringify(makePartial({project: 'Logistica'})));
        const {partials, missing} = mod.loadPartialsFromDisk(tmpPartialsDir, ['PuntoVenta', 'Logistica']);
        assert.strictEqual(partials.length, 2, 'ambos parciales cargados');
        assert.deepStrictEqual(partials.map((p) => p.project), ['PuntoVenta', 'Logistica']);
        assert.deepStrictEqual(missing, [], 'sin faltantes');
        cleanupTmpPartials();
    });

    await it('loadPartialsFromDisk: archivo ausente → project en missing', () => {
        cleanupTmpPartials();
        writePartialFile('PuntoVenta', JSON.stringify(makePartial({project: 'PuntoVenta'})));
        const {partials, missing} = mod.loadPartialsFromDisk(tmpPartialsDir, ['PuntoVenta', 'Clientes']);
        assert.strictEqual(partials.length, 1);
        assert.deepStrictEqual(missing, ['Clientes'], 'proyecto sin parcial → missing');
        cleanupTmpPartials();
    });

    await it('loadPartialsFromDisk: JSON corrupto → missing + aviso, no lanza', () => {
        cleanupTmpPartials();
        writePartialFile('PuntoVenta', '{esto-no-es-json');
        const origWarn = console.warn;
        const warns: string[] = [];
        console.warn = (m?: unknown) => {
            warns.push(String(m));
        };
        let result: {partials: DiscordPartialShape[]; missing: string[]} | undefined;
        try {
            result = mod.loadPartialsFromDisk(tmpPartialsDir, ['PuntoVenta']);
        } finally {
            console.warn = origWarn;
        }
        assert.deepStrictEqual(result!.partials, [], 'corrupto no carga parcial');
        assert.deepStrictEqual(result!.missing, ['PuntoVenta'], 'corrupto tratado como missing');
        assert.ok(warns.some((w) => w.includes('corrupto') || w.includes('inválido')), 'debe avisar del corrupto');
        cleanupTmpPartials();
    });

    await it('loadPartialsFromDisk: JSON válido pero estructura inválida → missing', () => {
        cleanupTmpPartials();
        writePartialFile('PuntoVenta', JSON.stringify({foo: 'bar'}));
        const {partials, missing} = mod.loadPartialsFromDisk(tmpPartialsDir, ['PuntoVenta']);
        assert.deepStrictEqual(partials, [], 'estructura inválida no carga');
        assert.deepStrictEqual(missing, ['PuntoVenta']);
        cleanupTmpPartials();
    });

    await it('loadPartialsFromDisk: mezcla válido/faltante/corrupto → split correcto', () => {
        cleanupTmpPartials();
        writePartialFile('PuntoVenta', JSON.stringify(makePartial({project: 'PuntoVenta'})));
        writePartialFile('Logistica', 'no-json{');
        const {partials, missing} = mod.loadPartialsFromDisk(tmpPartialsDir, ['PuntoVenta', 'Facturacion', 'Logistica', 'Clientes']);
        assert.deepStrictEqual(partials.map((p) => p.project), ['PuntoVenta'], 'solo el válido');
        assert.deepStrictEqual(missing, ['Facturacion', 'Logistica', 'Clientes'], 'faltante + corrupto en missing');
        cleanupTmpPartials();
    });

    
    console.log('  ── postToDiscord (dryRun→log; POST real vía fetch mock) ──');

    await it('postToDiscord: dryRun → NO llama fetch y no lanza', async () => {
        const fake = mockFetch();
        try {
            await mod.postToDiscord('hola', {webhookUrl: 'https://example.test/hook', dryRun: true});
        } finally {
            fake.restore();
        }
        assert.strictEqual(fake.calls.length, 0, 'dryRun no debe hacer HTTP');
    });

    await it('postToDiscord: POST real → fetch con URL, method POST y body {content}', async () => {
        const fake = mockFetch(async () => ({ok: true} as Response));
        try {
            await mod.postToDiscord('mensaje de prueba', {webhookUrl: 'https://discord.example/hook', dryRun: false});
        } finally {
            fake.restore();
        }
        assert.strictEqual(fake.calls.length, 1);
        assert.strictEqual(fake.calls[0].url, 'https://discord.example/hook');
        assert.strictEqual(fake.calls[0].init.method, 'POST');
        assert.strictEqual(JSON.parse(fake.calls[0].init.body).content, 'mensaje de prueba');
    });

    await it('postToDiscord: fetch rechaza o !ok → no propaga (no bloquea la corrida)', async () => {
        const fake = mockFetch(async () => {
            throw new Error('red caída');
        });
        try {
            await mod.postToDiscord('x', {webhookUrl: 'https://example.test/hook', dryRun: false});
        } finally {
            fake.restore();
        }
        const fake2 = mockFetch(async () => ({ok: false, status: 429, statusText: 'Too Many Requests'} as Response));
        try {
            await mod.postToDiscord('y', {webhookUrl: 'https://example.test/hook', dryRun: false});
        } finally {
            fake2.restore();
        }
    });

    
    console.log('  ── DiscordReporter (onTestEnd/onEnd: setup, retry final, parciales, solo-fallos) ──');

    await it('reporter: setup excluido, solo intento final, qaFailures con meta funcional', async () => {
        clearDiscordVars();
        clearPwVars();
        process.env.DISCORD_REPORT_ENABLED = '1';
        process.env.PW_DISCORD_MODE = 'partial';
        process.env.PW_DISCORD_PROJECT = 'PuntoVenta';
        const Rep = requireReporterModule();
        const reporter = new Rep.default();
        const fake = mockFetch();

        
        reporter.onTestEnd(
            fakeTest({title: 'setup de datos', location: {file: 'tests/Emisiones/PuntoVenta/datos-adicionales.setup.ts'}}),
            fakeResult({status: 'failed', error: {message: 'boom'}}),
        );
        
        reporter.onTestEnd(
            fakeTest({title: 'authenticate', location: {file: 'tests/auth.setup.ts'}}),
            fakeResult({status: 'passed'}),
        );
        
        reporter.onTestEnd(
            fakeTest({title: 'intento intermedio con retry', retries: 1}),
            fakeResult({status: 'failed', retry: 0, error: {message: 'boom'}}),
        );
        
        reporter.onTestEnd(
            fakeTest({title: 'intento final falla', retries: 1}),
            fakeResult({
                status: 'failed',
                retry: 1,
                error: {
                    message: 'El botón no apareció\n__PW_FUNCTIONAL_META__={"caseName":"Emitir boleta","failedStep":"Confirmar emisión","userMessage":"El botón no quedó visible","moduleOrScreen":"PuntoVenta","technicalError":"x","failureCategory":"SCRIPT"}',
                },
            }),
        );
        
        reporter.onTestEnd(
            fakeTest({title: 'boleta pasa'}),
            fakeResult({status: 'passed'}),
        );

        const partialFile = path.join(PARTIALS_DIR, 'PuntoVenta.json');
        if (fs.existsSync(partialFile)) fs.unlinkSync(partialFile);
        try {
            await reporter.onEnd({status: 'failed', startTime: Date.now(), duration: 5000});
        } finally {
            fake.restore();
        }
        assert.ok(fs.existsSync(partialFile), 'debe escribir el parcial');
        const written = JSON.parse(fs.readFileSync(partialFile, 'utf8'));
        assert.strictEqual(written.project, 'PuntoVenta');
        assert.strictEqual(written.module, 'PuntoVenta/Boleta', 'módulo = carpeta real del spec ejecutado');
        assert.strictEqual(written.passed, 1, 'setups (datos + authenticate) y retry intermedio NO cuentan');
        assert.strictEqual(written.failed, 1, 'solo el intento final cuenta');
        assert.strictEqual(written.errors, 0);
        assert.strictEqual(written.skipped, 0);
        assert.strictEqual(written.durationMs, 5000, 'duración = FullResult.duration');
        assert.strictEqual(written.qaFailures.length, 1);
        assert.strictEqual(written.qaFailures[0].caseName, 'Emitir boleta', 'meta funcional parseada');
        assert.strictEqual(written.qaFailures[0].failureCategory, 'SCRIPT');
        assert.strictEqual(written.qaFailures[0].failedStep, 'Confirmar emisión');
        fs.unlinkSync(partialFile);
    });

    await it('reporter: fallback de proyecto desde PW_REPORT_OUTPUT', async () => {
        clearDiscordVars();
        clearPwVars();
        process.env.DISCORD_REPORT_ENABLED = '1';
        process.env.PW_DISCORD_MODE = 'partial';
        process.env.PW_REPORT_OUTPUT = 'test-results/puntoventa/results.json';
        const Rep = requireReporterModule();
        const reporter = new Rep.default();
        const fake = mockFetch();
        reporter.onTestEnd(fakeTest(), fakeResult({status: 'passed'}));
        const partialFile = path.join(PARTIALS_DIR, 'PuntoVenta.json');
        if (fs.existsSync(partialFile)) fs.unlinkSync(partialFile);
        try {
            await reporter.onEnd({status: 'passed', startTime: Date.now(), duration: 1000});
        } finally {
            fake.restore();
        }
        const written = JSON.parse(fs.readFileSync(partialFile, 'utf8'));
        assert.strictEqual(written.project, 'PuntoVenta');
        assert.strictEqual(written.passed, 1);
        fs.unlinkSync(partialFile);
    });

    await it('reporter: fallback sin meta funcional → userMessage con el error real y categoría DATOS', async () => {
        clearDiscordVars();
        clearPwVars();
        process.env.DISCORD_REPORT_ENABLED = '1';
        process.env.PW_DISCORD_MODE = 'partial';
        process.env.PW_DISCORD_PROJECT = 'Facturacion';
        const Rep = requireReporterModule();
        const reporter = new Rep.default();
        const fake = mockFetch();

        reporter.onTestEnd(
            fakeTest({title: 'FC-CT convertir detalle'}),
            fakeResult({
                status: 'failed',
                retry: 1,
                error: {
                    message: [
                        'Error: La cotización 137 debería mostrar Facturado="SI" tras convertir desde detalle. Valores encontrados: ["No"]',
                        '',
                        'expect(received).toBe(expected) // Object.is equality',
                        '',
                        'Expected: true',
                        'Received: false',
                        '    at validarFacturadoSi (tests\\Emisiones\\Facturacion\\cotizacion\\FC-CT-convertir-detalle.spec.ts:54:7)',
                    ].join('\n'),
                },
            }),
        );

        const partialFile = path.join(PARTIALS_DIR, 'Facturacion.json');
        if (fs.existsSync(partialFile)) fs.unlinkSync(partialFile);
        try {
            await reporter.onEnd({status: 'failed', startTime: Date.now(), duration: 5000});
        } finally {
            fake.restore();
        }
        assert.ok(fs.existsSync(partialFile), 'debe escribir el parcial');
        const written = JSON.parse(fs.readFileSync(partialFile, 'utf8'));
        assert.strictEqual(written.qaFailures.length, 1, 'un solo fallo funcional');
        const failure = written.qaFailures[0];
        assert.strictEqual(failure.failureCategory, 'DATOS', 'aserción plana → categoría DATOS');
        assert.ok(failure.userMessage.includes('La cotización 137 debería mostrar Facturado="SI"'), 'debe mostrar el error real');
        assert.ok(!failure.userMessage.includes('Ocurrió un error durante el flujo'), 'no debe usar el mensaje genérico');
        fs.unlinkSync(partialFile);
    });

    await it('reporter: solo-fallos activo + corrida verde → NO hace fetch', async () => {
        clearDiscordVars();
        clearPwVars();
        process.env.DISCORD_REPORT_ENABLED = '1';
        process.env.DISCORD_WEBHOOK_URL = 'https://example.test/hook';
        process.env.DISCORD_ONLY_FAILURES = '1';
        const Rep = requireReporterModule();
        const reporter = new Rep.default();
        const fake = mockFetch();
        reporter.onTestEnd(fakeTest(), fakeResult({status: 'passed'}));
        try {
            await reporter.onEnd({status: 'passed', startTime: Date.now(), duration: 1000});
        } finally {
            fake.restore();
        }
        assert.strictEqual(fake.calls.length, 0, 'solo-fallos con verde no debe enviar');
    });

    await it('reporter: directo con webhook → POST con mensaje formateado (fallos + tester)', async () => {
        clearDiscordVars();
        clearPwVars();
        process.env.DISCORD_REPORT_ENABLED = '1';
        process.env.DISCORD_WEBHOOK_URL = 'https://example.test/hook';
        process.env.DISCORD_TESTER_NAME = 'Ana';
        process.env.ENV_NAME = 'crt';
        const Rep = requireReporterModule();
        const reporter = new Rep.default();
        const fake = mockFetch(async () => ({ok: true} as Response));
        reporter.onTestEnd(
            fakeTest({title: 'falla de boleta'}),
            fakeResult({status: 'failed', retry: 1, error: {message: 'se rompió el locator'}}),
        );
        try {
            await reporter.onEnd({status: 'failed', startTime: Date.now(), duration: 3000});
        } finally {
            fake.restore();
        }
        assert.strictEqual(fake.calls.length, 1);
        assert.strictEqual(fake.calls[0].url, 'https://example.test/hook');
        const content = JSON.parse(fake.calls[0].init.body).content;
        assert.ok(content.includes('❌ **FALLIDO**'), 'estado fallido');
        assert.ok(content.includes('falla de boleta'), 'caso del fallo');
        assert.ok(content.includes('Ana'), 'tester en metadata');
        assert.ok(content.includes('CRT'), 'entorno en metadata');
        delete process.env.ENV_NAME;
    });

    await it('reporter: sin webhook → warning y sin fetch (no bloquea)', async () => {
        clearDiscordVars();
        clearPwVars();
        process.env.DISCORD_REPORT_ENABLED = '1';
        const Rep = requireReporterModule();
        const reporter = new Rep.default();
        const fake = mockFetch();
        const origWarn = console.warn;
        const warns: string[] = [];
        console.warn = (m?: unknown) => {
            warns.push(String(m));
        };
        try {
            await reporter.onEnd({status: 'passed', startTime: Date.now(), duration: 1000});
        } finally {
            fake.restore();
            console.warn = origWarn;
        }
        assert.strictEqual(fake.calls.length, 0);
        assert.ok(warns.some((w) => w.includes('DISCORD_WEBHOOK_URL')), 'debe advertir por webhook ausente');
    });

    await it('reporter: gate off (DISCORD_REPORT_ENABLED ausente) → inerte sin fetch ni errores', async () => {
        clearDiscordVars();
        clearPwVars();
        process.env.DISCORD_WEBHOOK_URL = 'https://example.test/hook';
        const Rep = requireReporterModule();
        const reporter = new Rep.default();
        const fake = mockFetch();
        try {
            await reporter.onEnd({status: 'failed', startTime: Date.now(), duration: 1000});
        } finally {
            fake.restore();
        }
        assert.strictEqual(fake.calls.length, 0, 'gate off no debe hacer HTTP');
    });

    
    console.log('  ── playwright.config.ts — gate DISCORD_REPORT_ENABLED ──');

    await it('playwright.config.ts: gate off → reporter array SIN discord; gate on → CON discord', async () => {
        
        const cfgResolved = require.resolve('../../playwright.config');
        const envResolved2 = require.resolve('../../config/env');
        delete require.cache[cfgResolved];
        delete require.cache[envResolved2];
        delete process.env.DISCORD_REPORT_ENABLED;
        const offCfg = (require(cfgResolved) as any).default ?? (require(cfgResolved) as any);
        const offReporters = (offCfg.reporter as any[]).map((r) => (Array.isArray(r) ? r[0] : r));
        assert.ok(!offReporters.includes('./src/utils/discord-reporter.ts'), 'gate off: no debe registrarse');

        delete require.cache[cfgResolved];
        delete require.cache[envResolved2];
        process.env.DISCORD_REPORT_ENABLED = '1';
        const onCfg = (require(cfgResolved) as any).default ?? (require(cfgResolved) as any);
        const onReporters = (onCfg.reporter as any[]).map((r) => (Array.isArray(r) ? r[0] : r));
        assert.ok(onReporters.includes('./src/utils/discord-reporter.ts'), 'gate on: debe registrarse');
        delete process.env.DISCORD_REPORT_ENABLED;
    });

    console.log(`\n  ──────────────────────────────────────`);
    console.log(`  Total: ${passed + failed} | ✅ ${passed} passed | ❌ ${failed} failed\n`);

    if (failed > 0) {
        process.exit(1);
    }
}

main().catch((e) => {
    console.error('\n  Test suite error:', e);
    process.exit(1);
});
