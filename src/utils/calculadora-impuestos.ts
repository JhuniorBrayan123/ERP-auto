export interface TotalesCalculados {
  
  baseImponible: string;
  
  igv: string;
  
  tasaIGV: number;
}

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
