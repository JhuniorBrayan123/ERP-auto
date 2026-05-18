/**
 * Helper para extraer precios de ítems desde la fábrica (source of truth).
 *
 * En lugar de hardcodear "10.25" o "S/ 1.56" en los tests, este helper
 * lee el precioVenta del template original y calcula los totales esperados
 * usando la calculadora de impuestos.
 *
 * Uso en tests:
 *   const { total, subtotal, igv } = calcularTotalesDeItem('COMBO_EXONERADO');
 *   expect(await cajero.pregunta(TotalEnCarrito(total))).toBe(true);
 */
import { getTemplate } from '../factories/item-factory';
import { calcularTotales, calcularTotalesExonerado } from './calculadora-impuestos';

export interface TotalesItem {
    /** Precio total formateado (ej. "10.25") */
    total: string;
    /** Subtotal / Base imponible formateado con prefijo (ej. "S/ 8.69") */
    subtotalConPrefijo: string;
    /** IGV formateado con prefijo (ej. "S/ 1.56") */
    igvConPrefijo: string;
    /** Precio total raw como número */
    totalNumerico: number;
    /** Base imponible raw como string (ej. "8.69") */
    subtotal: string;
    /** IGV raw como string (ej. "1.56") */
    igv: string;
}

/**
 * Calcula los totales esperados para un ítem dado su KEY del factory.
 *
 * @param key - Clave del template (ej. 'COMBO_EXONERADO', 'PRODUCTO_GRAVADO')
 * @param cantidad - Cantidad de ítems (default: 1)
 * @param opciones - Configuración adicional
 * @param opciones.esExonerado - Si true, usa cálculo exonerado (IGV = 0). Default: false
 * @param opciones.tasaIGV - Tasa de IGV (default: 0.18)
 *
 * @example
 *   // Item gravado (con IGV 18%)
 *   const t = calcularTotalesDeItem('PRODUCTO_GRAVADO');
 *   // t.total = "10.25", t.subtotal = "8.69", t.igv = "1.56"
 *
 * @example
 *   // Item exonerado (sin IGV)
 *   const t = calcularTotalesDeItem('COMBO_EXONERADO', 1, { esExonerado: true });
 *   // t.total = "10.25", t.subtotal = "10.25", t.igv = "0.00"
 */
export function calcularTotalesDeItem(
    key: string,
    cantidad: number = 1,
    opciones?: { esExonerado?: boolean; tasaIGV?: number },
): TotalesItem {
    const template = getTemplate(key);
    if (!template) {
        throw new Error(
            `[precio-item] No se encontró template para key "${key}". ` +
            `Keys disponibles: ${getKeysDisponibles().join(', ')}`,
        );
    }

    const precioVenta = parseFloat(template.config.precioVenta);
    const totalBruto = precioVenta * cantidad;

    const esExonerado = opciones?.esExonerado ?? false;
    const tasaIGV = opciones?.tasaIGV ?? 0.18;

    const resultado = esExonerado
        ? calcularTotalesExonerado(precioVenta, cantidad)
        : calcularTotales(precioVenta, cantidad, tasaIGV);

    return {
        total: totalBruto.toFixed(2),
        subtotalConPrefijo: `S/ ${resultado.baseImponible}`,
        igvConPrefijo: `S/ ${resultado.igv}`,
        totalNumerico: totalBruto,
        subtotal: resultado.baseImponible,
        igv: resultado.igv,
    };
}

/**
 * Extrae solo el precio de venta de un template, formateado.
 *
 * @param key - Clave del template
 * @returns Precio como string (ej. "10.25")
 */
export function obtenerPrecioVenta(key: string): string {
    const template = getTemplate(key);
    if (!template) {
        throw new Error(`[precio-item] Template "${key}" no encontrado.`);
    }
    return parseFloat(template.config.precioVenta).toFixed(2);
}

/**
 * Calcula totales para múltiples ítems sumados.
 *
 * @param items - Array de { key, cantidad, esExonerado? }
 * @returns Totales combinados
 *
 * @example
 *   const t = calcularTotalesCombinados([
 *     { key: 'ITEM_GRAVADO_SIN_CONTROL', cantidad: 1 },
 *     { key: 'PRODUCTO_GRAVADO', cantidad: 1 },
 *   ]);
 */
export function calcularTotalesCombinados(
    items: Array<{ key: string; cantidad?: number; esExonerado?: boolean; tasaIGV?: number }>,
): TotalesItem {
    let totalAcumulado = 0;
    let subtotalAcumulado = 0;
    let igvAcumulado = 0;

    for (const item of items) {
        const t = calcularTotalesDeItem(item.key, item.cantidad ?? 1, {
            esExonerado: item.esExonerado,
            tasaIGV: item.tasaIGV,
        });
        totalAcumulado += t.totalNumerico;
        subtotalAcumulado += parseFloat(t.subtotal);
        igvAcumulado += parseFloat(t.igv);
    }

    const subtotalStr = subtotalAcumulado.toFixed(2);
    const igvStr = igvAcumulado.toFixed(2);
    const totalStr = totalAcumulado.toFixed(2);

    return {
        total: totalStr,
        subtotalConPrefijo: `S/ ${subtotalStr}`,
        igvConPrefijo: `S/ ${igvStr}`,
        totalNumerico: totalAcumulado,
        subtotal: subtotalStr,
        igv: igvStr,
    };
}

// ─── Utilidad interna ───────────────────────────────────────────────────

function getKeysDisponibles(): string[] {
    // Importar dinámicamente para evitar circular reference
    const { ITEM_TEMPLATES } = require('../factories/item-factory');
    return ITEM_TEMPLATES.map((t: { key: string }) => t.key);
}
