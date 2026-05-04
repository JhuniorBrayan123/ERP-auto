import {type Page} from '@playwright/test';

export const FUNCTIONAL_META_PREFIX = '__PW_FUNCTIONAL_META__=';

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
};

export class FunctionalTestError extends Error {
    readonly caseName?: string;
    readonly failedStep: string;
    readonly userMessage: string;
    readonly moduleOrScreen: string;
    readonly technicalError?: string;
    readonly observedState?: string;

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

    return {
        caseName: input.caseName,
        failedStep,
        userMessage,
        moduleOrScreen,
        technicalError,
        observedState: input.observedState,
        cause: input.cause,
    };
}

export type FunctionalErrorMeta = {
    caseName?: string;
    failedStep: string;
    userMessage: string;
    moduleOrScreen: string;
    technicalError?: string;
    observedState?: string;
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
