/**
 * Helper para seleccionar aleatoriamente un tipo de afectación IGV.
 *
 * Contiene la lista completa de tipos de afectación del sistema ERP2.
 * En cada ejecución selecciona uno diferente al azar, evitando
 * que los tests siempre editen al mismo tipo.
 */

export const TIPOS_AFECTACION_IGV = [
  'Gravado (Paga IGV 18%)',
  'Gravado - Retiro por premio (Paga IGV 18%)',
  'Gravado - Retiro por donacion (Paga IGV 18%)',
  'Gravado - Retiro (Paga IGV 18%)',
  'Gravado - Retiro por publicidad (Paga IGV 18%)',
  'Gravado - Bonificaciones (Paga IGV 18%)',
  'Gravado - Retiro por entrega a trabajadores (Paga IGV 18%)',
  'Exonerado (No paga IGV)',
  'Exonerado - Transferencia Gratuita',
  'Inafecto (No paga IGV)',
  'Inafecto - Retiro por Bonificación',
  'Inafecto - Retiro',
  'Inafecto - Retiro por Muestras Médicas',
  'Inafecto - Retiro por Convenio Colectivo',
  'Inafecto - Retiro por Premio',
  'Inafecto - Retiro por Publicidad',
  'Exportación',
] as const;

export type TipoAfectacionIGV = typeof TIPOS_AFECTACION_IGV[number];

/**
 * Selecciona un tipo de afectación IGV al azar de la lista completa.
 *
 * @returns Texto exacto del tipo de afectación seleccionado
 */
export function getRandomAffectationType(): TipoAfectacionIGV {
  const index = Math.floor(Math.random() * TIPOS_AFECTACION_IGV.length);
  return TIPOS_AFECTACION_IGV[index];
}

/**
 * Selecciona un tipo de afectación IGV al azar, excluyendo el tipo actual.
 * Útil para garantizar que siempre se haga un cambio real.
 *
 * @param currentType - Tipo de afectación actual del item (para excluirlo)
 * @returns Texto exacto del tipo de afectación seleccionado (diferente al actual)
 */
export function getRandomAffectationTypeExcluding(currentType: string): TipoAfectacionIGV {
  const opciones = TIPOS_AFECTACION_IGV.filter(tipo => tipo !== currentType);
  const index = Math.floor(Math.random() * opciones.length);
  return opciones[index];
}
