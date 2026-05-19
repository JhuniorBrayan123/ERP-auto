import { expect } from '@playwright/test';
import { type TotalesCalculados } from './calculadora-impuestos';

/**
 * Valida los totales capturados de la UI contra los calculados.
 *
 * Estrategia:
 *   1. Subtotal e IGV → validar contra lo calculado (determinístico)
 *   2. Retención/Detracción → si existen en UI, solo verificar que sean números válidos
 *   3. Total → calcular desde la UI (subtotal + IGV + extras) y validar contra el total mostrado
 *
 * Auto-detección: solo valida las filas que existen en la UI.
 */
export function validarTotales(
  uiTotales: Record<string, string>,
  calculados: TotalesCalculados,
  tolerancia: number = 0.02,
): void {
  // 1. Validar Subtotal contra base imponible calculada
  const subtotalUI = uiTotales['Subtotal'];
  if (subtotalUI !== undefined) {
    const diff = Math.abs(parseFloat(subtotalUI) - parseFloat(calculados.baseImponible));
    expect(diff, `Subtotal: esperado ${calculados.baseImponible}, UI muestra ${subtotalUI}`).toBeLessThanOrEqual(tolerancia);
  }

  // 2. Validar IGV contra IGV calculado
  const igvUI = uiTotales['IGV'];
  if (igvUI !== undefined) {
    const diff = Math.abs(parseFloat(igvUI) - parseFloat(calculados.igv));
    expect(diff, `IGV: esperado ${calculados.igv}, UI muestra ${igvUI}`).toBeLessThanOrEqual(tolerancia);
  }

  // 3. Retención: si existe, solo verificar que sea un número válido >= 0
  const retencionUI = uiTotales['Total retenciones'];
  let retencion = 0;
  if (retencionUI !== undefined) {
    retencion = parseFloat(retencionUI);
    expect(retencion, `Retención debe ser un número válido`).toBeGreaterThanOrEqual(0);
  }

  // 4. Detracción: si existe, solo verificar que sea un número válido >= 0
  const detraccionUI = uiTotales['Monto Detracción Soles'];
  let detraccion = 0;
  if (detraccionUI !== undefined) {
    detraccion = parseFloat(detraccionUI);
    expect(detraccion, `Detracción debe ser un número válido`).toBeGreaterThanOrEqual(0);
  }

  // 5. Validar Total: calcular desde la UI y comparar con el total mostrado
  const totalUI = uiTotales['Total'];
  if (totalUI !== undefined) {
    const totalCalculadoDesdeUI = parseFloat(calculados.baseImponible) + parseFloat(calculados.igv) + retencion + detraccion;
    const totalMostrado = parseFloat(totalUI);
    const diff = Math.abs(totalCalculadoDesdeUI - totalMostrado);
    expect(diff, `Total: esperado ${totalCalculadoDesdeUI.toFixed(2)}, UI muestra ${totalMostrado}`).toBeLessThanOrEqual(tolerancia);
  }
}

/**
 * Valida solo campos específicos en el popup de totales.
 * Útil para verificar "Operaciones Gravadas" u otros conceptos del desglose.
 */
export function validarCamposEspecificos(
  uiTotales: Record<string, string>,
  campos: Array<{ label: string; esperado: string }>,
  tolerancia: number = 0.02,
): void {
  for (const campo of campos) {
    const valorUI = uiTotales[campo.label];
    if (valorUI === undefined) continue; // no existe en UI → skip

    const diff = Math.abs(parseFloat(valorUI) - parseFloat(campo.esperado));
    expect(
      diff,
      `${campo.label}: esperado ${campo.esperado}, UI muestra ${valorUI}`,
    ).toBeLessThanOrEqual(tolerancia);
  }
}
