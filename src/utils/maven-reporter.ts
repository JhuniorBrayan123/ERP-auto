/**
 * Custom Playwright Reporter — Estilo Maven/Surefire
 *
 * Transforma la salida de consola de Playwright para imitar visualmente
 * el formato de ejecución de un proyecto Java con Maven/TestNG/Surefire.
 *
 * Colores ANSI utilizados (sin dependencias externas):
 *   - Magenta (\x1b[35m) → nombre del test
 *   - Verde   (\x1b[32m) → éxito
 *   - Rojo    (\x1b[31m) → error
 *   - Cyan    (\x1b[36m) → encabezados informativos
 *   - Amarillo(\x1b[33m) → warnings / skipped
 *   - Bold    (\x1b[1m)  → énfasis
 *   - Reset   (\x1b[0m)  → restaurar color
 */
import type {
    FullConfig,
    FullResult,
    Reporter,
    Suite,
    TestCase,
    TestResult,
    TestStep,
} from '@playwright/test/reporter';

// ─── Códigos ANSI ────────────────────────────────────────────────────
const RESET   = '\x1b[0m';
const BOLD    = '\x1b[1m';
const RED     = '\x1b[31m';
const GREEN   = '\x1b[32m';
const YELLOW  = '\x1b[33m';
const CYAN    = '\x1b[36m';
const MAGENTA = '\x1b[35m';

// ─── Constantes visuales ─────────────────────────────────────────────
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

    // ─── Lifecycle hooks ─────────────────────────────────────────────

    onBegin(config: FullConfig, suite: Suite): void {
        this.startTime = Date.now();
        this.totalTests = suite.allTests().length;
        this.suiteName = this.extractSuiteName(suite);

        console.log('');
        console.log(`${CYAN}${SEPARATOR}${RESET}`);
        console.log(`${CYAN} T E S T S  (${this.totalTests})${RESET}`);
        console.log(`${CYAN}${SEPARATOR}${RESET}`);
        console.log(`${CYAN}Running${RESET} ${this.suiteName}`);
        console.log('');
    }

    onTestBegin(test: TestCase): void {
        const isRetry = this.startedTests.has(test.id);
        if (!isRetry) {
            this.currentTestNumber++;
            this.startedTests.add(test.id);
        }

        const retryPrefix = isRetry ? `[RETRY ${test.results.length}] ` : '';
        // Imprime el nombre con su numeración progresiva y hace salto de línea automático
        console.log(`${MAGENTA}[${this.currentTestNumber}/${this.totalTests}] ${retryPrefix}${test.title}${RESET}`);
    }

    onStepBegin(test: TestCase, result: TestResult, step: TestStep): void {
        // Ignora hooks internos como "Before Hooks" o "browserContext.newPage"
        if (step.category === 'test.step') {
            // \r = volver al inicio, \x1b[K = borrar hasta el fin de la línea
            process.stdout.write(`${OVERWRITE_LINE}  ${CYAN}-> Ejecutando: ${step.title}${RESET}`);
        }
    }

    onTestEnd(test: TestCase, result: TestResult): void {
        const duration = (result.duration / 1000).toFixed(1);

        // Limpiar el último step que quedó escrito en consola antes del resultado final
        process.stdout.write(OVERWRITE_LINE);

        const willRetry = (result.status === 'failed' || result.status === 'timedOut') && result.retry < test.retries;

        if (willRetry) {
            console.log(`${YELLOW}---Resultado: Falló intento ${result.retry + 1}. Reintentando...${RESET} (${duration}s)`);
            return; // No sumar a los contadores finales si el test se va a reintentar
        }

        switch (result.status) {
            case 'passed':
                this.passed++;
                console.log(`${GREEN}---Resultado: Este test se ejecutó con éxito${RESET} (${duration}s)`);
                break;

            case 'failed':
                this.failed++;
                this.printFailure(duration, result);
                break;

            case 'timedOut':
                this.errors++;
                this.printTimeout(duration, result);
                break;

            case 'skipped':
                this.skipped++;
                console.log(`${YELLOW}---Resultado: Test omitido (skipped)${RESET}`);
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

        // ─── Bloque de resultados por suite (estilo Surefire) ────────
        console.log('');
        const statsLine = `Tests run: ${totalRun}, Failures: ${this.failed}, Errors: ${this.errors}, Skipped: ${this.skipped}, Time elapsed: ${timeFormatted} - in ${this.suiteName}`;
        console.log(hasFailures ? `${RED}${statsLine}${RESET}` : `${GREEN}${statsLine}${RESET}`);

        // ─── Bloque BUILD SUCCESS / FAILURE ──────────────────────────
        console.log('');
        console.log(DOUBLE_SEP);
        console.log(hasFailures
            ? `${RED}${BOLD}BUILD FAILURE${RESET}`
            : `${GREEN}${BOLD}BUILD SUCCESS${RESET}`);
        console.log(DOUBLE_SEP);
        console.log(`${CYAN}[INFO]${RESET} Total time:  ${timeFormatted}`);
        console.log(`${CYAN}[INFO]${RESET} Finished at: ${this.formatDate(new Date())}`);
        console.log(DOUBLE_SEP);

        // ─── Resumen de fallos (si existen) ──────────────────────────
        if (hasFailures) {
            console.log('');
            console.log(`${RED}[ERROR] Tests run: ${totalRun}, Failures: ${this.failed}, Errors: ${this.errors}, Skipped: ${this.skipped}${RESET}`);
        }

        console.log('');
    }

    // ─── Métodos de impresión por resultado ──────────────────────────

    private printFailure(duration: string, result: TestResult): void {
        const errorMessage = result.error?.message || 'Error desconocido';
        const stackTrace = result.error?.stack || '';

        console.log(`${RED}---Resultado: El test falló${RESET} (${duration}s)`);
        console.log(`${RED}[ERROR] AssertionError:${RESET}`);
        console.log(`${RED}[ERROR]   ${this.cleanAnsi(errorMessage)}${RESET}`);

        if (stackTrace) {
            for (const line of this.extractRelevantStack(stackTrace)) {
                console.log(`${RED}[ERROR]     at ${line}${RESET}`);
            }
        }
    }

    private printTimeout(duration: string, result: TestResult): void {
        const errorMessage = result.error?.message || 'Timeout excedido';

        console.log(`${RED}---Resultado: El test falló por timeout${RESET} (${duration}s)`);
        console.log(`${RED}[ERROR] TimeoutError:${RESET}`);
        console.log(`${RED}[ERROR]   ${this.cleanAnsi(errorMessage)}${RESET}`);
    }

    // ─── Utilidades ──────────────────────────────────────────────────

    /** Convierte milisegundos a formato legible: 'X min Y sec' o 'X sec'. */
    private formatDuration(ms: number): string {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        if (minutes > 0) {
            return `${minutes} min ${seconds} sec`;
        }
        return `${seconds} sec`;
    }

    /** Formatea fecha en estilo legible local: '18 de abril de 2026, 07:25:07 p.\u00a0m.' */
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

    /** Extrae el nombre del primer suite/describe de la jerarquía. */
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

    /** Limpia códigos ANSI del mensaje para evitar doble coloreo. */
    private cleanAnsi(text: string): string {
        // eslint-disable-next-line no-control-regex
        return text.replace(/\x1b\[[0-9;]*m/g, '').trim();
    }

    /** Extrae las primeras líneas relevantes del stack trace. */
    private extractRelevantStack(stack: string): string[] {
        return stack
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.startsWith('at ') || line.includes('.spec.ts'))
            .slice(0, 5)
            .map((line) => this.cleanAnsi(line).replace(/^at /, ''));
    }
}

export default MavenReporter;
