import {getTemplate} from '@factories/item-factory';
import {calcularTotales, calcularTotalesExonerado} from './calculadora-impuestos';

export interface TotalesItem {
    
    total: string;
    
    subtotalConPrefijo: string;
    
    igvConPrefijo: string;
    
    totalNumerico: number;
    
    subtotal: string;
    
    igv: string;
}

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

export function obtenerPrecioVenta(key: string): string {
    const template = getTemplate(key);
    if (!template) {
        throw new Error(`[precio-item] Template "${key}" no encontrado.`);
    }
    return parseFloat(template.config.precioVenta).toFixed(2);
}

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

function getKeysDisponibles(): string[] {
    
    const {ITEM_TEMPLATES} = require('../factories/item-factory');
    return ITEM_TEMPLATES.map((t: { key: string }) => t.key);
}
