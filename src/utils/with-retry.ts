export interface RetryOptions {
    maxRetries?: number;
    backoffMs?: number;
    retryOn?: (outcome: RetryOutcome) => boolean;
    label?: string;
    sleep?: (ms: number) => Promise<void>;
}

export type RetryOutcome =
    | { kind: 'response'; status: number }
    | { kind: 'error'; error: unknown };

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BACKOFF_MS = 2000;

function defaultRetryOn(outcome: RetryOutcome): boolean {
    if (outcome.kind === 'response') {
        return (outcome.status >= 500 && outcome.status < 600) || outcome.status === 429;
    }
    return true;
}

function defaultSleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function classify(value: unknown): RetryOutcome | null {
    if (
        value !== null &&
        typeof value === 'object' &&
        typeof (value as { status?: unknown }).status === 'function'
    ) {
        return { kind: 'response', status: (value as { status: () => number }).status() };
    }
    return null;
}

export async function withRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T> {
    const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
    const backoffMs = options?.backoffMs ?? DEFAULT_BACKOFF_MS;
    const retryOn = options?.retryOn ?? defaultRetryOn;
    const label = options?.label ?? 'withRetry';
    const sleep = options?.sleep ?? defaultSleep;

    let attempt = 1;

    for (;;) {
        try {
            const value = await fn();
            const outcome = classify(value);

            if (outcome === null || !retryOn(outcome) || attempt === maxRetries) {
                return value;
            }

            const errorLine = outcome.kind === 'response' ? String(outcome.status) : String((outcome.error as Error)?.message ?? outcome.error);
            console.warn(
                `[Retry] ${label}\n` +
                `Error: ${errorLine}\n` +
                `Intento: ${attempt}/${maxRetries}\n` +
                `Esperando: ${backoffMs}ms`,
            );

            await sleep(backoffMs);
            attempt++;
        } catch (error) {
            const outcome: RetryOutcome = { kind: 'error', error };

            if (!retryOn(outcome) || attempt === maxRetries) {
                throw error;
            }

            const errorLine = (error as Error)?.message ?? String(error);
            console.warn(
                `[Retry] ${label}\n` +
                `Error: ${errorLine}\n` +
                `Intento: ${attempt}/${maxRetries}\n` +
                `Esperando: ${backoffMs}ms`,
            );

            await sleep(backoffMs);
            attempt++;
        }
    }
}
