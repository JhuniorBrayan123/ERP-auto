import {expect, type Locator, type Page} from '@playwright/test';

export const FUNCTIONAL_META_PREFIX = '__PW_FUNCTIONAL_META__=';

export type FailureCategory = 'AMBIENTE' | 'DATOS' | 'SCRIPT' | 'DESCONOCIDO';

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

export const DEFAULT_UI_MESSAGES = {
  loading: 'el sistema está procesando (loader visible)',
  errorModal: (texto: string) => `el sistema muestra un modal de error: "${texto.slice(0, 200)}"`,
  toast: (texto: string) => `el sistema muestra una notificación: "${texto.slice(0, 200)}"`,
  validation: (textos: string[]) => `el formulario muestra errores: "${textos.join(' | ')}"`,
  pageError: 'la pantalla mostró un error del sistema',
};

export interface UiMessages {
  loading: string;
  errorModal: (texto: string) => string;
  toast: (texto: string) => string;
  validation: (textos: string[]) => string;
  pageError: string;
}

export async function detectCommonUiState(
  page: Page,
  messages?: Partial<UiMessages>,
): Promise<string | undefined> {
  const m: UiMessages = {...DEFAULT_UI_MESSAGES, ...messages};
  const observations: string[] = [];

  const overloadVisible = await isVisibleSafe(page.locator('[id="cmn_cmp-overload:loading"]'));
  if (overloadVisible) observations.push(m.loading);

  const errorModal = page.locator('#cmn_cmp-overscreen\\:block.is-open');
  if (await isVisibleSafe(errorModal)) {
    const texto = (await errorModal.textContent().catch(() => ''))?.trim();
    if (texto) observations.push(m.errorModal(texto));
  }

  const pageErrorVisible = await isVisibleSafe(page.locator('.cmp-page-error'));
  if (pageErrorVisible) observations.push(m.pageError);

  const toast = page.locator('.toast, .v-toast, .v-notification, .swal2-popup, .notyf');
  if (await toast.first().isVisible({timeout: 300}).catch(() => false)) {
    const texto = (await toast.first().textContent().catch(() => ''))?.trim();
    if (texto) observations.push(m.toast(texto));
  }

  const validaciones = page.locator('.v-messages__message, .error-text, .invalid-feedback');
  const textos = (await validaciones.allTextContents().catch(() => []))
    .filter(t => t.trim()).slice(0, 3);
  if (textos.length) observations.push(m.validation(textos));

  if (!observations.length) return undefined;
  return observations.join('. además ');
}

export async function verificarVisible(
  page: Page,
  locator: Locator,
  options: {
    elemento: string;
    paso?: string;
    caso?: string;
    timeout?: number;
    uiMessages?: Partial<UiMessages>;
  },
): Promise<void> {
  try {
    await expect(locator).toBeVisible({timeout: options.timeout ?? 15_000});
  } catch (error) {
    const observedState = await detectCommonUiState(page, options.uiMessages);
    const diagnosis = observedState
      ? `No se encontró "${options.elemento}" en la pantalla porque ${observedState}.`
      : `No se encontró "${options.elemento}" en la pantalla. No se detectaron mensajes de error visibles.`;

    throw new FunctionalTestError({
      caseName: options.caso,
      failedStep: options.paso ?? 'Verificar visibilidad en pantalla',
      userMessage: diagnosis,
      moduleOrScreen: 'Módulo no identificado',
      technicalError: error instanceof Error ? error.message : String(error),
      observedState,
      failureCategory: 'DATOS',
    });
  }
}

export async function throwFunctionalError(input: Omit<FunctionalErrorInput, 'observedState'> & {
  page?: Page;
  observedState?: string;
  uiMessages?: Partial<UiMessages>;
}): Promise<never> {
  const observedState = input.observedState ?? (input.page ? await detectCommonUiState(input.page, input.uiMessages) : undefined);
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
