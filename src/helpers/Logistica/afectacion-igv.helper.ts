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

export function getRandomAffectationType(): TipoAfectacionIGV {
  const index = Math.floor(Math.random() * TIPOS_AFECTACION_IGV.length);
  return TIPOS_AFECTACION_IGV[index];
}

export function getRandomAffectationTypeExcluding(currentType: string): TipoAfectacionIGV {
  const opciones = TIPOS_AFECTACION_IGV.filter(tipo => tipo !== currentType);
  const index = Math.floor(Math.random() * opciones.length);
  return opciones[index];
}
