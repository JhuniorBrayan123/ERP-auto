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

const SEPARATOR  = '-------------------------------------------------------';
const DOUBLE_SEP = '------------------------------------------------------------------------';
const OVERWRITE_LINE = '\r\x1b[K';

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

    private activeTestInfo: { title: string; attempt: number; isRetry: boolean } | null = null;
    private currentTestPrinted = false;

    onBegin(_: unknown, suite: Suite): void {
        this.startTime = Date.now();
        
        let effectiveTotal = suite.allTests().length;
        for (const test of suite.allTests()) {
            if (process.env.SKIP_PV_SETUP === '1' && test.title.includes('preparar datos base')) {
                effectiveTotal--;
            } else if (process.env.SKIP_PV_ITEMS_SETUP === '1' && test.title.includes('preparar ítems base')) {
                effectiveTotal--;
            } else if (process.env.SKIP_DATOS_SETUP === '1' && test.title.includes('preparar datos adicionales')) {
                effectiveTotal--;
            }
        }
        
        this.totalTests = effectiveTotal;
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
        this.ensureTestTitlePrinted();

        if (step.category === 'test.step') {

            process.stdout.write(`${OVERWRITE_LINE}  ${CYAN}-> Ejecutando: ${step.title}${RESET}`);
        }
    }

    onTestEnd(test: TestCase, result: TestResult): void {
        const duration = (result.duration / 1000).toFixed(1);

        if (result.status === 'skipped') {

            if (process.env.SKIP_PV_SETUP === '1' && test.title.includes('preparar datos base')) return;
            if (process.env.SKIP_PV_ITEMS_SETUP === '1' && test.title.includes('preparar ítems base')) return;
            if (process.env.SKIP_DATOS_SETUP === '1' && test.title.includes('preparar datos adicionales')) return;
            
            this.skipped++;
            return;
        }

        this.ensureTestTitlePrinted();

        process.stdout.write(OVERWRITE_LINE);

        const willRetry = (result.status === 'failed' || result.status === 'timedOut') && result.retry < test.retries;

        if (willRetry) {
            console.log(`${YELLOW}---Resultado: Falló intento ${result.retry + 1}. Reintentando...${RESET} (${duration}s)`);
            return;
        }

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
        // eslint-disable-next-line no-control-regex
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
