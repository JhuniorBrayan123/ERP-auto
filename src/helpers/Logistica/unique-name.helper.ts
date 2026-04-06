/**
 * Helper centralizado para generar nombres únicos y trazables por tipo de item.
 *
 * Cada item creado en la suite tendrá un nombre que incluye:
 * - Tipo de item (capitalizado)
 * - Descripción base del escenario
 * - Fecha y hora exacta de ejecución (zona horaria Lima)
 *
 * Esto permite rastrear exactamente cuándo se creó cada registro
 * tanto en la lista de ítems como en Ver Ítem y bitácora.
 */

export type TipoItem = 'producto' | 'servicio' | 'insumo' | 'combo' | 'receta' | 'lista';

export function buildUniqueItemName(tipoItem: TipoItem, descripcionBase: string): string {
  const fecha = new Date();
  const fechaHora = fecha
    .toLocaleString('es-PE', { timeZone: 'America/Lima' })
    .replace(/[\/:]/g, '-')
    .replace(', ', '_');

  const tipoCapitalizado = tipoItem.charAt(0).toUpperCase() + tipoItem.slice(1);
  return `${tipoCapitalizado} ${descripcionBase} ${fechaHora}`;
}
