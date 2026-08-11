import { expect } from '@playwright/test';
import { type TotalesCalculados } from './calculadora-impuestos';

export function validarTotales(
  uiTotales: Record<string, string>,
  calculados: TotalesCalculados,
  tolerancia: number = 0.02,
): void {
  
  const subtotalUI = uiTotales['Subtotal'];
  if (subtotalUI !== undefined) {
    const diff = Math.abs(parseFloat(subtotalUI) - parseFloat(calculados.baseImponible));
    expect(diff, `Subtotal: esperado ${calculados.baseImponible}, UI muestra ${subtotalUI}`).toBeLessThanOrEqual(tolerancia);
  }

  const igvUI = uiTotales['IGV'];
  if (igvUI !== undefined) {
    const diff = Math.abs(parseFloat(igvUI) - parseFloat(calculados.igv));
    expect(diff, `IGV: esperado ${calculados.igv}, UI muestra ${igvUI}`).toBeLessThanOrEqual(tolerancia);
  }

  const retencionUI = uiTotales['Total retenciones'];
  let retencion = 0;
  if (retencionUI !== undefined) {
    retencion = parseFloat(retencionUI);
    expect(retencion, `Retención debe ser un número válido`).toBeGreaterThanOrEqual(0);
  }

  const detraccionUI = uiTotales['Monto Detracción Soles'];
  let detraccion = 0;
  if (detraccionUI !== undefined) {
    detraccion = parseFloat(detraccionUI);
    expect(detraccion, `Detracción debe ser un número válido`).toBeGreaterThanOrEqual(0);
  }

  const totalUI = uiTotales['Total'];
  if (totalUI !== undefined) {
    const totalCalculadoDesdeUI = parseFloat(calculados.baseImponible) + parseFloat(calculados.igv) + retencion + detraccion;
    const totalMostrado = parseFloat(totalUI);
    const diff = Math.abs(totalCalculadoDesdeUI - totalMostrado);
    expect(diff, `Total: esperado ${totalCalculadoDesdeUI.toFixed(2)}, UI muestra ${totalMostrado}`).toBeLessThanOrEqual(tolerancia);
  }
}

export function validarCamposEspecificos(
  uiTotales: Record<string, string>,
  campos: Array<{ label: string; esperado: string }>,
  tolerancia: number = 0.02,
): void {
  for (const campo of campos) {
    const valorUI = uiTotales[campo.label];
    if (valorUI === undefined) continue; 

    const diff = Math.abs(parseFloat(valorUI) - parseFloat(campo.esperado));
    expect(
      diff,
      `${campo.label}: esperado ${campo.esperado}, UI muestra ${valorUI}`,
    ).toBeLessThanOrEqual(tolerancia);
  }
}
