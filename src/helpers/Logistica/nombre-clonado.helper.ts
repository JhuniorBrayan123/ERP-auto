/**
 * Helper centralizado para generar nombres únicos en escenarios de clonado.
 *
 * Genera un nombre que incluye:
 * - Descripción base del item origen
 * - Sufijo "CLONADO"
 * - Fecha y hora exacta de ejecución (zona horaria Lima)
 *
 * Esto permite rastrear exactamente cuándo se clonó cada registro
 * tanto en la lista de ítems como en Ver Ítem y bitácora.
 */

export function buildUniqueClonedItemName(descripcionBase: string): string {
  const fechaHora = new Date()
    .toLocaleString('es-PE', { timeZone: 'America/Lima' })
    .replace(/[\/:]/g, '-')
    .replace(', ', '_');

  return `${descripcionBase} - CLONADO ${fechaHora}`;
}
