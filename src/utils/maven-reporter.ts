import path from 'node:path';
import type {
    FullResult,
    Reporter,
    Suite,
    TestCase,
    TestResult,
    TestStep,
} from '@playwright/test/reporter';
import {getEnvironmentLabel} from './environment-label';
import {parseFunctionalMeta, type FunctionalErrorMeta} from './functional-error';

const RESET   = '\x1b[0m';
const BOLD    = '\x1b[1m';
const RED     = '\x1b[31m';
const GREEN   = '\x1b[32m';
const YELLOW  = '\x1b[33m';
const CYAN    = '\x1b[36m';
const MAGENTA = '\x1b[35m';
const BLUE    = '\x1b[34m';

const SEPARATOR  = '-------------------------------------------------------';
const DOUBLE_SEP = '------------------------------------------------------------------------';
const OVERWRITE_LINE = '\r\x1b[K';


function resolveModuleAndSubmodule(filePath: string): { module: string; submodule: string | null } {
    const normalized = filePath.replace(/\\/g, '/');
    
    
    
    const parts = normalized.split('/');
    const testsIdx = parts.indexOf('tests');
    if (testsIdx === -1 || parts.length < testsIdx + 3) {
        return { module: 'unknown', submodule: null };
    }
    const root = parts[testsIdx + 1];
    const mod = parts[testsIdx + 2];

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

interface ModuleCounter {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    errors: number;
}

class MavenReporter implements Reporter {
    private passed  = 0;
    private failed  = 0;
    private skipped = 0;
    private errors  = 0;
    private totalTests = 0;
    private currentTestNumber = 0;
    private startTime = 0;
    private suiteName = '';
    private startedTests = new Set<string>();
    private readonly environmentLabel = getEnvironmentLabel();
    private readonly printTechnical = process.env.PW_TECHNICAL_ERRORS === '1';
    private readonly qaFailures: Array<{
        caseName: string;
        failedStep: string;
        userMessage: string;
        failureCategory: string;
    }> = [];

    
    private modules = new Map<string, ModuleCounter>();
    private submodules = new Map<string, Map<string, ModuleCounter>>();

    private activeTestInfo: { title: string; attempt: number; isRetry: boolean } | null = null;
    private currentTestPrinted = false;

    
    private isSetupTest(test: TestCase): boolean {
        const file = test.location?.file ?? '';
        return file.includes('.setup.ts') && !file.includes('auth.setup.ts');
    }

    onBegin(_: unknown, suite: Suite): void {
        this.startTime = Date.now();
        
        const allTests = suite.allTests();
        const realTests = allTests.filter(t => !this.isSetupTest(t));
        this.totalTests = realTests.length;
        this.suiteName = this.extractSuiteName(suite);

        console.log('');
        console.log(`${CYAN}${SEPARATOR}${RESET}`);
        console.log(`${CYAN} T E S T S  (${this.totalTests})${RESET}`);
        console.log(`${CYAN}${SEPARATOR}${RESET}`);
        console.log(`${CYAN}Running${RESET} ${this.suiteName}`);
        console.log(`Entorno: ${this.environmentLabel}`);
        console.log('');
    }

    onTestBegin(test: TestCase): void {
        if (this.isSetupTest(test)) return;

        const isRetry = this.startedTests.has(test.id);
        if (!isRetry) {
            this.startedTests.add(test.id);
        }

        this.activeTestInfo = {
            title: test.title,
            attempt: test.results.length,
            isRetry,
        };
        this.currentTestPrinted = false;
    }

    private ensureTestTitlePrinted(): void {
        if (!this.currentTestPrinted && this.activeTestInfo) {
            if (!this.activeTestInfo.isRetry) {
                this.currentTestNumber++;
            }
            const retryPrefix = this.activeTestInfo.isRetry ? `[RETRY ${this.activeTestInfo.attempt}] ` : '';
            console.log(`${MAGENTA}[${this.currentTestNumber}/${this.totalTests}] ${retryPrefix}${this.activeTestInfo.title}${RESET}`);
            this.currentTestPrinted = true;
        }
    }

    onStepBegin(test: TestCase, result: TestResult, step: TestStep): void {
        if (this.isSetupTest(test)) return;

        this.ensureTestTitlePrinted();

        if (step.category === 'test.step') {

            process.stdout.write(`${OVERWRITE_LINE}  ${CYAN}-> Ejecutando: ${step.title}${RESET}`);
        }
    }

    onTestEnd(test: TestCase, result: TestResult): void {
        const isSetup = this.isSetupTest(test);
        if (isSetup && result.status !== 'failed' && result.status !== 'timedOut') return;

        const duration = (result.duration / 1000).toFixed(1);

        this.ensureTestTitlePrinted();

        process.stdout.write(OVERWRITE_LINE);

        const willRetry = (result.status === 'failed' || result.status === 'timedOut') && result.retry < test.retries;

        if (willRetry) {
            console.log(`${YELLOW}---Resultado: Falló intento ${result.retry + 1}. Reintentando...${RESET} (${duration}s)`);
            return;
        }

        
        this.trackModuleResult(test, result);

        switch (result.status) {
            case 'passed':
                this.passed++;
                console.log(`${GREEN}---Resultado: Este test se ejecutó con éxito${RESET} (${duration}s)`);
                break;

            case 'failed':
                this.failed++;
                this.printFailure(test, duration, result);
                break;

            case 'timedOut':
                this.errors++;
                this.printTimeout(test, duration, result);
                break;

            default:
                break;
        }
    }

    private trackModuleResult(test: TestCase, result: TestResult): void {
        const { module: mod, submodule } = resolveModuleAndSubmodule(test.location?.file ?? '');
        if (mod === 'unknown') return;

        const status = result.status;

        
        if (!this.modules.has(mod)) {
            this.modules.set(mod, { total: 0, passed: 0, failed: 0, skipped: 0, errors: 0 });
        }
        const m = this.modules.get(mod)!;
        m.total++;
        if (status === 'passed') m.passed++;
        else if (status === 'failed' || status === 'timedOut') m.failed++;
        else if (status === 'skipped') m.skipped++;
        else m.errors++;

        
        const subKey = submodule || mod;
        if (!this.submodules.has(mod)) {
            this.submodules.set(mod, new Map());
        }
        const subs = this.submodules.get(mod)!;
        if (!subs.has(subKey)) {
            subs.set(subKey, { total: 0, passed: 0, failed: 0, skipped: 0, errors: 0 });
        }
        const s = subs.get(subKey)!;
        s.total++;
        if (status === 'passed') s.passed++;
        else if (status === 'failed' || status === 'timedOut') s.failed++;
        else if (status === 'skipped') s.skipped++;
        else s.errors++;
    }

    async onEnd(result: FullResult): Promise<void> {
        const elapsedMs = Date.now() - this.startTime;
        const totalRun = this.passed + this.failed + this.errors + this.skipped;
        const hasFailures = this.failed > 0 || this.errors > 0;
        const timeFormatted = this.formatDuration(elapsedMs);

        console.log('');
        console.log(SEPARATOR);
        console.log('RESUMEN FUNCIONAL DE FALLOS');
        if (this.qaFailures.length === 0) {
            console.log(`${GREEN}- Sin fallos funcionales${RESET}`);
        } else {

            const byCategory: Record<string, typeof this.qaFailures> = {};
            for (const item of this.qaFailures) {
                (byCategory[item.failureCategory] ??= []).push(item);
            }
            const order = ['AMBIENTE', 'DATOS', 'SCRIPT', 'DESCONOCIDO'];
            for (const cat of order) {
                const items = byCategory[cat];
                if (!items?.length) continue;
                const catColor = this.categoryColor(cat);
                console.log(`${catColor}[${cat}] — ${items.length} fallo(s)${RESET}`);
                for (const item of items) {
                    console.log(`  - ${item.caseName}`);
                    console.log(`    Paso:   ${item.failedStep}`);
                    console.log(`    Motivo: ${item.userMessage}`);
                }
            }

            console.log('');
            console.log('Distribución de fallos:');
            for (const cat of order) {
                const count = byCategory[cat]?.length ?? 0;
                if (!count) continue;
                const catColor = this.categoryColor(cat);
                const guide = cat === 'AMBIENTE'
                    ? '→ Verifica el ambiente CRT/QA (health checks)'
                    : cat === 'DATOS'
                    ? '→ Re-ejecuta los setup projects'
                    : cat === 'SCRIPT'
                    ? '→ Revisa selectores o lógica del test'
                    : '→ Revisa el reporte HTML para más detalles';
                console.log(`  ${catColor}${cat}: ${count}${RESET}  ${guide}`);
            }
        }
        console.log(SEPARATOR);

        console.log('');
        console.log(SEPARATOR);
        console.log('RESUMEN DE EJECUCIÓN');
        console.log(`Entorno: ${this.environmentLabel}`);
        console.log(`Tests run: ${totalRun}, Failures: ${this.failed}, Errors: ${this.errors}, Skipped: ${this.skipped}`);
        console.log(`Time elapsed: ${timeFormatted}`);
        console.log(SEPARATOR);

        
        this.printModuleReport();

        console.log('');
        console.log(DOUBLE_SEP);
        console.log(hasFailures
            ? `${RED}${BOLD}BUILD FAILURE${RESET}`
            : `${GREEN}${BOLD}BUILD SUCCESS${RESET}`);
        console.log(DOUBLE_SEP);
        console.log(`${CYAN}[INFO]${RESET} Total time:  ${timeFormatted}`);
        console.log(`${CYAN}[INFO]${RESET} Finished at: ${this.formatDate(new Date())}`);
        console.log(DOUBLE_SEP);
        console.log('');
    }

    private printModuleReport(): void {
        if (this.modules.size <= 1) return; // Only show when multiple modules or submodules

        const lineLen = 62;
        const sep = '\u2550'.repeat(lineLen);

        console.log('');
        console.log(`${CYAN}${sep}${RESET}`);
        console.log(`${CYAN}${BOLD}  REPORTE POR M\u00d3DULO${RESET}`);
        console.log(`${CYAN}${sep}${RESET}`);

        // Sort modules by name
        const sortedMods = [...this.modules.entries()].sort(([a], [b]) => a.localeCompare(b, 'es'));

        let grandTotal = 0, grandPassed = 0, grandFailed = 0, grandSkipped = 0, grandErrors = 0;

        for (const [mod, modStat] of sortedMods) {
            const statusColor = modStat.failed > 0 || modStat.errors > 0 ? RED : GREEN;
            const modLine =
                ` ${statusColor}\uD83D\uDCC1 ${mod}${RESET}` +
                ` ${String(modStat.total).padStart(5)}` +
                `  ${GREEN}\u2705 ${String(modStat.passed).padStart(4)}${RESET}` +
                `  ${RED}\u274C ${String(modStat.failed).padStart(4)}${RESET}` +
                (modStat.skipped > 0 ? `  ${YELLOW}\u23ED ${modStat.skipped}${RESET}` : '') +
                (modStat.errors > 0 ? `  ${YELLOW}\u26A0 ${modStat.errors}${RESET}` : '');
            console.log(modLine);

            // Show submodules
            const subs = this.submodules.get(mod);
            if (subs && subs.size > 0) {
                const sortedSubs = [...subs.entries()].sort(([a], [b]) => a.localeCompare(b, 'es'));
                for (const [subName, subStat] of sortedSubs) {
                    const subColor = subStat.failed > 0 || subStat.errors > 0 ? RED : GREEN;
                    const paddedName = (subName + '                         ').slice(0, 22);
                    console.log(
                        `   ${subColor}\uD83D\uDCC2 ${paddedName}${RESET}` +
                        ` ${String(subStat.total).padStart(3)}` +
                        `   ${GREEN}${String(subStat.passed).padStart(3)}${RESET}` +
                        `   ${RED}${String(subStat.failed).padStart(3)}${RESET}`,
                    );
                }
            }

            grandTotal += modStat.total;
            grandPassed += modStat.passed;
            grandFailed += modStat.failed;
            grandSkipped += modStat.skipped;
            grandErrors += modStat.errors;
        }

        const dashLine = '\u2500'.repeat(lineLen);
        console.log(` ${dashLine}`);
        const totalColor = grandFailed > 0 || grandErrors > 0 ? RED : GREEN;
        const totalLine =
            ` ${CYAN}\uD83D\uDCE6 TOTAL${RESET}` +
            ` ${String(grandTotal).padStart(5)}` +
            `  ${GREEN}\u2705 ${String(grandPassed).padStart(4)}${RESET}` +
            `  ${RED}\u274C ${String(grandFailed).padStart(4)}${RESET}` +
            (grandSkipped > 0 ? `  ${YELLOW}\u23ED ${grandSkipped}${RESET}` : '') +
            (grandErrors > 0 ? `  ${YELLOW}\u26A0 ${grandErrors}${RESET}` : '');
        console.log(totalLine);
        console.log(`${CYAN}${sep}${RESET}`);
        console.log('');
    }

    private printFailure(test: TestCase, duration: string, result: TestResult): void {
        console.log(`${RED}---Resultado: El test falló${RESET} (${duration}s)`);
        this.printQaFailure(test, result);
        this.printTechnicalDetails(result);
    }

    private printTimeout(test: TestCase, duration: string, result: TestResult): void {
        console.log(`${RED}---Resultado: El test falló por timeout${RESET} (${duration}s)`);
        this.printQaFailure(test, result);
        this.printTechnicalDetails(result);
    }

    private formatDuration(ms: number): string {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        if (minutes > 0) {
            return `${minutes} min ${seconds} sec`;
        }
        return `${seconds} sec`;
    }

    private formatDate(date: Date): string {
        return date.toLocaleString('es-PE', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
    }

    private extractSuiteName(suite: Suite): string {
        const allTests = suite.allTests();
        if (allTests.length > 0) {
            let parent = allTests[0].parent;
            while (parent.parent && parent.parent.title) {
                parent = parent.parent;
            }
            return parent.title || 'TestSuite';
        }
        return 'TestSuite';
    }

    private cleanAnsi(text: string): string {
        
        return text.replace(/\x1b\[[0-9;]*m/g, '').trim();
    }

    private extractRelevantStack(stack: string): string[] {
        return stack
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.startsWith('at ') || line.includes('.spec.ts'))
            .slice(0, 5)
            .map((line) => this.cleanAnsi(line).replace(/^at /, ''));
    }

    private printQaFailure(test: TestCase, result: TestResult): void {
        const summary = this.buildFunctionalSummary(test, result);
        const category = summary.failureCategory ?? 'DESCONOCIDO';
        const categoryColor = this.categoryColor(category);

        this.qaFailures.push({
            caseName: summary.caseName ?? test.title,
            failedStep: summary.failedStep,
            userMessage: summary.userMessage,
            failureCategory: category,
        });

        console.log(`${RED}[FAIL][QA]${RESET} ${categoryColor}[${category}]${RESET}`);
        console.log(`${RED}Caso: ${summary.caseName}${RESET}`);
        console.log(`${RED}Paso: ${summary.failedStep}${RESET}`);
        console.log(`${RED}Motivo: ${summary.userMessage}${RESET}`);
    }

    private categoryColor(category: string): string {
        switch (category) {
            case 'AMBIENTE':    return '\x1b[33m'; 
            case 'DATOS':       return '\x1b[36m'; 
            case 'SCRIPT':      return '\x1b[35m'; 
            default:            return '\x1b[37m'; 
        }
    }

    private printTechnicalDetails(result: TestResult): void {
        if (!this.printTechnical) {
            return;
        }

        const errorMessage = result.error?.message || 'Error desconocido';
        const stackTrace = result.error?.stack || '';
        const technicalLines = this.cleanAnsi(errorMessage)
            .split('\n')
            .filter((line) => line && !line.includes('__PW_FUNCTIONAL_META__='));

        console.log(`${YELLOW}[TECH] Error técnico:${RESET}`);
        for (const line of technicalLines.slice(0, 4)) {
            console.log(`${YELLOW}[TECH]   ${line}${RESET}`);
        }

        if (stackTrace) {
            for (const line of this.extractRelevantStack(stackTrace)) {
                console.log(`${YELLOW}[TECH]   at ${line}${RESET}`);
            }
        }
    }

    private buildFunctionalSummary(test: TestCase, result: TestResult): FunctionalErrorMeta & { caseName: string } {
        const rawMessage = result.error?.message ?? '';
        const parsed = parseFunctionalMeta(rawMessage);
        if (parsed) {
            return {
                ...parsed,
                caseName: parsed.caseName ?? test.title,
            };
        }

        const firstLine = this.cleanAnsi(rawMessage).split('\n')[0] || 'No se pudo completar el flujo por un error no controlado.';
        const isTimeout = result.status === 'timedOut' || firstLine.toLowerCase().includes('timeout');
        const userMessage = isTimeout
            ? 'La pantalla no quedó lista para continuar el flujo.'
            : 'Ocurrió un error durante el flujo y no se pudo completar el paso esperado.';

        return {
            caseName: test.title,
            failedStep: this.getFailedStep(result),
            userMessage,
            moduleOrScreen: 'No identificado',
            technicalError: firstLine,
        };
    }

    private getFailedStep(result: TestResult): string {
        const testSteps = result.steps.filter((step) => step.category === 'test.step');
        const failed = testSteps.find((step) => step.error);
        if (failed?.title) return failed.title;
        const last = testSteps[testSteps.length - 1];
        return last?.title ?? 'Paso no identificado';
    }

}

export default MavenReporter;
