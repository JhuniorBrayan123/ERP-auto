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

export const ESTADOS_TRANSITORIOS = new Set<EstadoSunat>([
    EstadoSunat.PENDIENTE_ENVIO,
    EstadoSunat.PENDIENTE_RESPUESTA,
    EstadoSunat.NO_DISPONIBLE,
]);

export const ESTADOS_FINALES_VALIDOS = new Set<EstadoSunat>([
    EstadoSunat.ACEPTADA,
    EstadoSunat.ACEPTADA_OBSERVADA,
]);

export const ESTADOS_FINALES_INVALIDOS = new Set<EstadoSunat>([
    EstadoSunat.RECHAZADA,
    EstadoSunat.IGNORADA,
    EstadoSunat.ERRONEO,
    EstadoSunat.ELIMINADO,
    EstadoSunat.DADO_DE_BAJA,
]);

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

export interface WaitSunatOptions {
    
    pollingInterval?: number;
    
    timeout?: number;
}

export interface SunatPollResult {
    
    estado: EstadoSunat;
    
    nombreEstado: string;
    
    aceptado: boolean;
    
    rechazado: boolean;
    
    timeout: boolean;
    
    intentos: number;
}

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

        console.log(
            `  ⏳ SUNAT en ${getNombreEstado(ultimoEstado as EstadoSunat)} — ` +
            `reintento en ${pollingInterval / 1000}s (intento ${intentos})`,
        );
        await new Promise(resolve => setTimeout(resolve, pollingInterval));
    }

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
