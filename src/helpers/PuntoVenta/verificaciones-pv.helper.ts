/**
 * Verificaciones reutilizables para PuntoVenta.
 *
 * Encapsula steps de validación de stock/kardex post-emisión
 * usando composición controlada desde Logística (solo KardexApi).
 *
 * NO importa pages ni fixtures de Logística — solo el service de lectura.
 */
import { expect } from '@playwright/test';
import { test } from '../../fixtures/PuntoVenta/emision-fixture';
import type { KardexApi } from '../../services/Logistica/KardexApi';
import type { SunatEstadoApi } from '../../services/PuntoVenta/SunatEstadoApi';
import type { ComprobanteDetallePage } from '../../pages/PuntoVenta/ComprobanteDetallePage';
import { getNombreEstado, type EstadoSunat } from './sunat-estados.helper';

// ─── Verificación de stock post-emisión ───────────────────────────────

/**
 * Valida que el stock disminuyó correctamente después de una venta.
 * Usa KardexApi de Logística por composición (read-only).
 */
export async function verificarDescuentoStock(
    kardexApi: KardexApi,
    codigoProducto: string,
    saldoAnterior: number,
    cantidadVendida: number,
    almacenFiltro: string = 'AUTO',
): Promise<void> {
    await test.step(`Then: el stock de "${codigoProducto}" debe disminuir en ${cantidadVendida}`, async () => {
        const saldoActual = await kardexApi.obtenerSaldoPorProducto({
            codigoProducto,
            almacenFiltro,
        });
        expect(saldoActual).toBe(saldoAnterior - cantidadVendida);
    });
}

/**
 * Valida que el stock NO cambió (ej: adelanto, nota de venta sin stock).
 */
export async function verificarStockSinCambio(
    kardexApi: KardexApi,
    codigoProducto: string,
    saldoEsperado: number,
    almacenFiltro: string = 'AUTO',
): Promise<void> {
    await test.step(`Then: el stock de "${codigoProducto}" NO debe haber cambiado`, async () => {
        const saldoActual = await kardexApi.obtenerSaldoPorProducto({
            codigoProducto,
            almacenFiltro,
        });
        expect(saldoActual).toBe(saldoEsperado);
    });
}

// ─── Captura de saldo previo (para comparación post-emisión) ──────────

/**
 * Captura el saldo actual del producto antes de emitir.
 * Retorna el valor para uso posterior en assertions.
 */
export async function capturarSaldoAnterior(
    kardexApi: KardexApi,
    codigoProducto: string,
    almacenFiltro: string = 'AUTO',
): Promise<number> {
    let saldo = 0;
    await test.step(`Given: capturar stock actual de "${codigoProducto}" vía API`, async () => {
        saldo = await kardexApi.obtenerSaldoPorProducto({
            codigoProducto,
            almacenFiltro,
        });
    });
    return saldo;
}

// ─── Validación Capa 1: post-emisión inmediata ────────────────────────

/**
 * Validación inmediata post-emisión (Capa 1 de estrategia SUNAT).
 * Verifica que el comprobante se generó correctamente sin esperar SUNAT.
 */
export async function validarEmisionInmediata(
    comprobanteDetalle: ComprobanteDetallePage,
    serie: string,
    correlativo: string,
): Promise<void> {
    await test.step('Then: el comprobante debe haberse generado correctamente', async () => {
        expect(serie, 'Serie del comprobante no capturada').toBeTruthy();
        expect(correlativo, 'Correlativo del comprobante no capturado').toBeTruthy();
        await comprobanteDetalle.validarEstadoEmitido();
    });
}

// ─── Validación Capa 2: espera SUNAT ──────────────────────────────────

/**
 * Espera eventual SUNAT (Capa 2 de estrategia SUNAT).
 * Polling con estados transitorios tolerados.
 *
 * NUNCA falla el test — solo loguea el resultado:
 * - ✓ si fue aceptado
 * - ⚠️ si fue rechazado, inesperado o timeout
 */
export async function validarEstadoSunatFinal(
    sunatApi: SunatEstadoApi,
    comprobanteId: number,
    serie: string,
    correlativo: string,
    options?: { pollingInterval?: number; timeout?: number },
): Promise<void> {
    await test.step('And: consultar estado SUNAT del comprobante', async () => {
        const resultado = await sunatApi.esperarEstadoFinal(comprobanteId, options);

        if (resultado.aceptado) {
            console.log(`  ✓ SUNAT: ${serie}-${correlativo} → ${resultado.nombreEstado}`);
        } else if (resultado.rechazado) {
            console.warn(`  ⚠️  SUNAT: ${serie}-${correlativo} → ${resultado.nombreEstado} (no aceptado)`);
        } else if (resultado.timeout) {
            console.warn(`  ⚠️  SUNAT: ${serie}-${correlativo} → timeout, último estado: ${resultado.nombreEstado}`);
        } else {
            console.warn(`  ⚠️  SUNAT: ${serie}-${correlativo} → estado inesperado: ${resultado.nombreEstado}`);
        }
    });
}
