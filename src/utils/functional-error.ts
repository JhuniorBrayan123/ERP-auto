import {type Page} from '@playwright/test';

export const FUNCTIONAL_META_PREFIX = '__PW_FUNCTIONAL_META__=';

/**
 * Clasificación del fallo para que el equipo QA sepa dónde buscar la causa:
 *   AMBIENTE  → el entorno CRT/QA no respondió (timeout, servicio caído, red)
 *   DATOS     → faltaron datos de setup o datos del ambiente no coinciden
 *   SCRIPT    → selector desactualizado, lógica incorrecta en el test
 *   DESCONOCIDO → no se pudo determinar la causa automáticamente
 */
export type FailureCategory = 'AMBIENTE' | 'DATOS' | 'SCRIPT' | 'DESCONOCIDO';

/**
 * Detecta automáticamente la categoría de fallo a partir del error técnico.
 * Puede ser sobreescrita manualmente pasando `failureCategory` en el input.
 */
export function detectFailureCategory(
    error: unknown,
    observedState?: string,
): FailureCategory {
    const msg = [
        error instanceof Error ? error.message : String(error ?? ''),
        observedState ?? '',
    ]
        .join(' ')
        .toLowerCase();

    // ── AMBIENTE: problemas de red, timeout, servicios caídos ──────────
    const ambientePatterns = [
        'timeout',
        'timed out',
        'net::err',
        'econnrefused',
        'econnreset',
        'network',
        'navigation',
        'err_name_not_resolved',
        'blocked by overload',
        'loader',
        'quedó bloqueada',
        'health',
        'service unavailable',
        '503',
        '502',
        '504',
    ];
    if (ambientePatterns.some((p) => msg.includes(p))) return 'AMBIENTE';

    // ── DATOS: fallos en expects de negocio (stock, kardex, saldos) ────
    const datosPatterns = [
        'expect(received).tobe',
        'tobetruthy',
        'tobevisible',
        'tocontaintext',
        'already exists',
        'no se encontró',
        'not found',
        'storagestate',
        'user.json',
        'falta la variable',
        'find or create',
        'dato no encontrado',
        'saldo',
        'kardex',
        'stock',
    ];
    if (datosPatterns.some((p) => msg.includes(p))) return 'DATOS';

    // ── SCRIPT: selectores, locators, lógica del test ─────────────────
    const scriptPatterns = [
        'locator',
        'selector',
        'strict mode violation',
        'element not found',
        'getbyrole',
        'getbytext',
        'getbylabel',
        'getbyplaceholder',
        'nth(',
        'is not attached',
        'detached',
        'intercept',
        'unexpected token',
        'typeerror',
        'referenceerror',
        'cannot read propert',
    ];
    if (scriptPatterns.some((p) => msg.includes(p))) return 'SCRIPT';

    return 'DESCONOCIDO';
}

type FunctionalErrorInput = {
    caseName?: string;
    failedStep?: string;
    userMessage: string;
    moduleOrScreen?: string;
    technicalError?: string;
    module?: string;
    screen?: string;
    flowStep?: string;
    technicalDetail?: string;
    observedState?: string;
    cause?: unknown;
    /** Clasificación explícita del fallo. Si no se pasa, se detecta automáticamente. */
    failureCategory?: FailureCategory;
};

export class FunctionalTestError extends Error {
    readonly caseName?: string;
    readonly failedStep: string;
    readonly userMessage: string;
    readonly moduleOrScreen: string;
    readonly technicalError?: string;
    readonly observedState?: string;
    readonly failureCategory: FailureCategory;

    constructor(input: FunctionalErrorInput) {
        const normalized = normalizeInput(input);
        super(buildFunctionalErrorMessage(normalized));
        this.name = 'FunctionalTestError';
        this.caseName = normalized.caseName;
        this.failedStep = normalized.failedStep;
        this.userMessage = normalized.userMessage;
        this.moduleOrScreen = normalized.moduleOrScreen;
        this.technicalError = normalized.technicalError;
        this.observedState = normalized.observedState;
        this.failureCategory = normalized.failureCategory;
        (this as Error & { cause?: unknown }).cause = normalized.cause;
    }
}

export async function detectCommonUiState(page: Page): Promise<string | undefined> {
    const observations: string[] = [];

    const overloadVisible = await isVisibleSafe(page.locator('.cmp-overload, [id="cmn_cmp-overload:loading"]'));
    if (overloadVisible) {
        observations.push('la pantalla quedó bloqueada por el loader');
    }

    const pageErrorVisible = await isVisibleSafe(page.locator('.cmp-page-error'));
    if (pageErrorVisible) {
        observations.push('la pantalla mostró un error del sistema');
    }

    if (!observations.length) {
        return undefined;
    }

    return observations.join(' y luego ');
}

export async function throwFunctionalError(input: Omit<FunctionalErrorInput, 'observedState'> & {
    page?: Page;
    observedState?: string;
}): Promise<never> {
    const observedState = input.observedState ?? (input.page ? await detectCommonUiState(input.page) : undefined);
    throw new FunctionalTestError({...input, observedState});
}

function buildFunctionalErrorMessage(input: ReturnType<typeof normalizeInput>): string {
    const technicalCause = formatCause(input.cause);
    const technicalError = [input.technicalError, technicalCause].filter(Boolean).join(' | ');
    const payload = {
        caseName: input.caseName,
        failedStep: input.failedStep,
        userMessage: input.userMessage,
        moduleOrScreen: input.moduleOrScreen,
        technicalError,
        observedState: input.observedState,
        failureCategory: input.failureCategory,
    };
    return `${input.userMessage}\n${FUNCTIONAL_META_PREFIX}${JSON.stringify(payload)}`;
}

function formatCause(cause: unknown): string {
    if (!cause) {
        return '';
    }
    if (cause instanceof Error) {
        return `${cause.name}: ${cause.message}`;
    }
    return String(cause);
}

function normalizeInput(input: FunctionalErrorInput) {
    const failedStep = input.failedStep ?? input.flowStep ?? 'Paso no identificado';
    const moduleOrScreen = input.moduleOrScreen ?? ([input.module, input.screen].filter(Boolean).join(' > ') || 'Módulo no identificado');
    const technicalError = input.technicalError ?? input.technicalDetail;
    const userMessage = input.observedState
        ? `${input.userMessage} (${input.observedState}).`
        : input.userMessage;
    const failureCategory = input.failureCategory
        ?? detectFailureCategory(input.cause, input.observedState);

    return {
        caseName: input.caseName,
        failedStep,
        userMessage,
        moduleOrScreen,
        technicalError,
        observedState: input.observedState,
        cause: input.cause,
        failureCategory,
    };
}

export type FunctionalErrorMeta = {
    caseName?: string;
    failedStep: string;
    userMessage: string;
    moduleOrScreen: string;
    technicalError?: string;
    observedState?: string;
    failureCategory?: FailureCategory;
};

export function parseFunctionalMeta(message: string): FunctionalErrorMeta | null {
    const markerLine = message
        .split('\n')
        .map((line) => line.trim())
        .find((line) => line.startsWith(FUNCTIONAL_META_PREFIX));
    if (!markerLine) {
        return null;
    }
    const raw = markerLine.slice(FUNCTIONAL_META_PREFIX.length);
    try {
        return JSON.parse(raw) as FunctionalErrorMeta;
    } catch {
        return null;
    }
}

async function isVisibleSafe(locator: ReturnType<Page['locator']>): Promise<boolean> {
    try {
        return await locator.first().isVisible({timeout: 500});
    } catch {
        return false;
    }
}
