/**
 * Flow: Validación post-emisión.
 *
 * Coordina la secuencia de validaciones después de emitir un comprobante:
 * 1. Capa 1: Validación inmediata (comprobante existe, estado EMITIDO)
 * 2. Capa 2: Espera eventual SUNAT (polling controlado)
 * 3. Opcional: Validación de stock/kardex si el caso lo requiere
 */
import {expect, test} from '@playwright/test';
import type {ComprobanteDetallePage} from '../../pages/PuntoVenta/ComprobanteDetallePage';
import type {SunatEstadoApi} from '../../services/PuntoVenta/SunatEstadoApi';
import type {KardexApi} from '../../services/Logistica/KardexApi';
import type {EmisionResult} from '../../helpers/PuntoVenta/emision.types';
import type {WaitSunatOptions} from '../../helpers/PuntoVenta/sunat-estados.helper';

export interface ValidacionPostEmisionParams {
    resultado: EmisionResult;
    /** Si true, ejecuta polling SUNAT (Capa 2) */
    validarSunat?: boolean;
    /** Config de polling SUNAT */
    sunatOptions?: WaitSunatOptions;
    /** Si se proporciona, valida descuento de stock */
    stockValidacion?: {
        codigoProducto: string;
        saldoAnterior: number;
        cantidadVendida: number;
        almacenFiltro?: string;
    };
}

export interface ValidacionPostEmisionPages {
    comprobanteDetalle: ComprobanteDetallePage;
    sunatApi?: SunatEstadoApi;
    kardexApi?: KardexApi;
}

/**
 * Ejecuta la secuencia completa de validaciones post-emisión.
 */
export async function ejecutarValidacionPostEmision(
    pages: ValidacionPostEmisionPages,
    params: ValidacionPostEmisionParams,
): Promise<void> {
    const {resultado} = params;

    // ─── Capa 1: Validación inmediata ─────────────────────────────
    await test.step('Then: el comprobante debe haberse generado correctamente', async () => {
        expect(resultado.serie, 'Serie no capturada').toBeTruthy();
        expect(resultado.correlativo, 'Correlativo no capturado').toBeTruthy();
        await pages.comprobanteDetalle.validarEstadoEmitido();
        await pages.comprobanteDetalle.validarSinErrorEmision();
    });

    // ─── Capa 2: Espera SUNAT (opcional) — NUNCA falla ─────────────
    if (params.validarSunat && pages.sunatApi && resultado.comprobanteId) {
        await test.step('And: consultar estado SUNAT del comprobante', async () => {
            const sunatResult = await pages.sunatApi!.esperarEstadoFinal(
                resultado.comprobanteId,
                params.sunatOptions,
            );

            if (sunatResult.aceptado) {
                console.log(
                    `  ✓ SUNAT: ${resultado.serie}-${resultado.correlativo} → ${sunatResult.nombreEstado}`,
                );
            } else if (sunatResult.rechazado) {
                console.warn(
                    `    SUNAT: ${resultado.serie}-${resultado.correlativo} → ${sunatResult.nombreEstado} (no aceptado)`,
                );
            } else if (sunatResult.timeout) {
                console.warn(
                    `    SUNAT: ${resultado.serie}-${resultado.correlativo} → timeout, último estado: ${sunatResult.nombreEstado}`,
                );
            }
        });
    }

    // ─── Validación de stock (opcional) ───────────────────────────
    if (params.stockValidacion && pages.kardexApi) {
        const {codigoProducto, saldoAnterior, cantidadVendida, almacenFiltro} = params.stockValidacion;
        await test.step(`And: el stock de "${codigoProducto}" debe disminuir en ${cantidadVendida}`, async () => {
            const saldoActual = await pages.kardexApi!.obtenerSaldoPorProducto({
                codigoProducto,
                almacenFiltro: almacenFiltro ?? 'AUTO',
            });
            expect(saldoActual).toBe(saldoAnterior - cantidadVendida);
        });
    }
}
