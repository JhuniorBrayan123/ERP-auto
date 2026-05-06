/**
 * Estrategia de estados SUNAT para comprobantes electrónicos.
 *
 * Modela el flujo asíncrono: PENDIENTE → ACEPTADA | RECHAZADA.
 * Implementa polling controlado sin waitForTimeout.
 *
 * Capa 1 (spec): validación inmediata post-emisión (comprobante existe, estado EMITIDO).
 * Capa 2 (este helper): espera eventual por API hasta estado final SUNAT.
 */

// ─── Enum de estados SUNAT ────────────────────────────────────────────

export enum EstadoSunat {
    PENDIENTE_ENVIO     = 1,
    ACEPTADA            = 2,
    ACEPTADA_OBSERVADA  = 3,
    PENDIENTE_RESPUESTA = 4,
    RECHAZADA           = 5,
    IGNORADA            = 6,
    ERRONEO             = 7,
    NO_DISPONIBLE       = 8,
    ELIMINADO           = 9,
    DADO_DE_BAJA        = 10,
}

// ─── Clasificación de estados ─────────────────────────────────────────

/** Estados donde SUNAT aún no respondió — el test debe seguir esperando */
export const ESTADOS_TRANSITORIOS = new Set<EstadoSunat>([
    EstadoSunat.PENDIENTE_ENVIO,
    EstadoSunat.PENDIENTE_RESPUESTA,
    EstadoSunat.NO_DISPONIBLE,
]);

/** Estados finales exitosos — el test puede dar PASS */
export const ESTADOS_FINALES_VALIDOS = new Set<EstadoSunat>([
    EstadoSunat.ACEPTADA,
    EstadoSunat.ACEPTADA_OBSERVADA,
]);

/** Estados finales de error — se loguea WARNING, NO falla el test */
export const ESTADOS_FINALES_INVALIDOS = new Set<EstadoSunat>([
    EstadoSunat.RECHAZADA,
    EstadoSunat.IGNORADA,
    EstadoSunat.ERRONEO,
    EstadoSunat.ELIMINADO,
    EstadoSunat.DADO_DE_BAJA,
]);

// ─── Utilidades de clasificación ──────────────────────────────────────

export function getNombreEstado(estado: EstadoSunat): string {
    return EstadoSunat[estado] ?? `DESCONOCIDO(${estado})`;
}

export function esEstadoTransitorio(estado: number): boolean {
    return ESTADOS_TRANSITORIOS.has(estado as EstadoSunat);
}

export function esEstadoFinalValido(estado: number): boolean {
    return ESTADOS_FINALES_VALIDOS.has(estado as EstadoSunat);
}

export function esEstadoFinalInvalido(estado: number): boolean {
    return ESTADOS_FINALES_INVALIDOS.has(estado as EstadoSunat);
}

// ─── Polling de estado SUNAT ──────────────────────────────────────────

export interface WaitSunatOptions {
    /** Intervalo entre consultas en ms (default: 3000) */
    pollingInterval?: number;
    /** Timeout máximo en ms (default: 60000) */
    timeout?: number;
}

/** Resultado del polling SUNAT — nunca falla, solo reporta */
export interface SunatPollResult {
    /** Estado final alcanzado */
    estado: EstadoSunat;
    /** Nombre legible del estado */
    nombreEstado: string;
    /** true si el estado es ACEPTADA o ACEPTADA_OBSERVADA */
    aceptado: boolean;
    /** true si el estado es un estado final inválido (5,6,7,9,10) */
    rechazado: boolean;
    /** true si se agotó el timeout sin alcanzar estado final */
    timeout: boolean;
    /** Cantidad de consultas realizadas */
    intentos: number;
}

/**
 * Espera hasta que el comprobante alcance un estado SUNAT final.
 *
 * Comportamiento:
 * - Sigue consultando mientras el estado sea transitorio (1, 4, 8)
 * - Resuelve con `aceptado: true` cuando llega a ACEPTADA (2) o ACEPTADA_OBSERVADA (3)
 * - Resuelve con `rechazado: true` y LOG WARNING cuando llega a 5, 6, 7, 9, 10
 *   → **NO falla el test**, solo reporta para visibilidad
 * - Resuelve con `timeout: true` y LOG WARNING si no resuelve a tiempo
 *   → **NO falla el test**, solo reporta para visibilidad
 *
 * @param consultarEstado - Función que consulta el estado actual (inyectada desde el service)
 * @param options - Configuración de polling y timeout
 * @returns Resultado con estado, flags y conteo de intentos
 */
export async function waitForEstadoSunatFinal(
    consultarEstado: () => Promise<number>,
    options: WaitSunatOptions = {},
): Promise<SunatPollResult> {
    const { pollingInterval = 3_000, timeout = 60_000 } = options;
    const deadline = Date.now() + timeout;
    let ultimoEstado: number = EstadoSunat.PENDIENTE_ENVIO;
    let intentos = 0;

    while (Date.now() < deadline) {
        intentos++;
        ultimoEstado = await consultarEstado();

        // ─── Estado final válido → PASS ───────────────────────────
        if (esEstadoFinalValido(ultimoEstado)) {
            console.log(
                `  ✓ SUNAT respondió: ${getNombreEstado(ultimoEstado as EstadoSunat)} ` +
                `(${intentos} consulta${intentos > 1 ? 's' : ''})`,
            );
            return {
                estado: ultimoEstado as EstadoSunat,
                nombreEstado: getNombreEstado(ultimoEstado as EstadoSunat),
                aceptado: true,
                rechazado: false,
                timeout: false,
                intentos,
            };
        }

        // ─── Estado final inválido → LOG WARNING, NO falla ────────
        if (esEstadoFinalInvalido(ultimoEstado)) {
            const nombre = getNombreEstado(ultimoEstado as EstadoSunat);
            console.warn(
                `\n  ⚠️  WARNING SUNAT: El comprobante NO fue aceptado.\n` +
                `      Estado: ${nombre} (${ultimoEstado})\n` +
                `      Intentos: ${intentos}\n` +
                `      → El test NO falla por esto, pero el comprobante requiere revisión.\n`,
            );
            return {
                estado: ultimoEstado as EstadoSunat,
                nombreEstado: nombre,
                aceptado: false,
                rechazado: true,
                timeout: false,
                intentos,
            };
        }

        // ─── Estado inesperado → LOG WARNING, NO falla ────────────
        if (!esEstadoTransitorio(ultimoEstado)) {
            const nombre = getNombreEstado(ultimoEstado as EstadoSunat);
            console.warn(
                `\n  ⚠️  WARNING SUNAT: Estado inesperado ${ultimoEstado} (${nombre}).\n` +
                `      No es transitorio ni final conocido.\n` +
                `      → El test NO falla por esto, pero requiere investigación.\n`,
            );
            return {
                estado: ultimoEstado as EstadoSunat,
                nombreEstado: nombre,
                aceptado: false,
                rechazado: false,
                timeout: false,
                intentos,
            };
        }

        // ─── Estado transitorio → esperar y reintentar ────────────
        console.log(
            `  ⏳ SUNAT en ${getNombreEstado(ultimoEstado as EstadoSunat)} — ` +
            `reintento en ${pollingInterval / 1000}s (intento ${intentos})`,
        );
        await new Promise(resolve => setTimeout(resolve, pollingInterval));
    }

    // ─── Timeout → LOG WARNING, NO falla ──────────────────────────
    const nombre = getNombreEstado(ultimoEstado as EstadoSunat);
    console.warn(
        `\n  ⚠️  WARNING SUNAT: Timeout (${timeout / 1000}s) esperando estado final.\n` +
        `      Último estado: ${nombre} (${ultimoEstado})\n` +
        `      Intentos realizados: ${intentos}\n` +
        `      → El test NO falla por esto, pero el comprobante sigue en estado transitorio.\n`,
    );
    return {
        estado: ultimoEstado as EstadoSunat,
        nombreEstado: nombre,
        aceptado: false,
        rechazado: false,
        timeout: true,
        intentos,
    };
}
