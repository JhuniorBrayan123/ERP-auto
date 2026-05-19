/**
 * Calculadora de impuestos para validación de totales en Punto de Venta.
 *
 * Calcula SOLO lo determinístico: base imponible e IGV a partir del precio.
 *
 * Retención y detracción NO se predicen aquí — se leen directamente de la UI
 * porque dependen de reglas del cliente que el test no conoce de antemano.
 *
 * Lógica fiscal peruana:
 *   - IGV incluido en el precio (10% o 18% según cliente)
 *   - Base imponible = precio / (1 + tasaIGV)
 *   - IGV = precio - base imponible
 */

export interface TotalesCalculados {
  /** Base imponible (operaciones gravadas) */
  baseImponible: string;
  /** IGV calculado */
  igv: string;
  /** Tasa IGV usada (0.10 o 0.18) */
  tasaIGV: number;
}

/**
 * Calcula la base imponible e IGV a partir del precio unitario.
 *
 * @param precioUnitario - Precio unitario del item
 * @param cantidad - Cantidad de items (default: 1)
 * @param tasaIGV - 0.10 o 0.18 (default: 0.18)
 */
export function calcularTotales(
  precioUnitario: number,
  cantidad: number = 1,
  tasaIGV: number = 0.18,
): TotalesCalculados {
  const totalBruto = precioUnitario * cantidad;
  const baseImponible = Math.round((totalBruto / (1 + tasaIGV)) * 100) / 100;
  const igv = Math.round((totalBruto - baseImponible) * 100) / 100;

  return {
    baseImponible: baseImponible.toFixed(2),
    igv: igv.toFixed(2),
    tasaIGV,
  };
}

export function calcularTotalesExonerado(
  precioUnitario: number,
  cantidad: number = 1,
): TotalesCalculados {
  const total = precioUnitario * cantidad;

  return {
    baseImponible: total.toFixed(2),
    igv: '0.00',
    tasaIGV: 0,
  };
}
