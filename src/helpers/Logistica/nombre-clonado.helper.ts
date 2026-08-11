export function buildUniqueClonedItemName(descripcionBase: string): string {
  const fechaHora = new Date()
    .toLocaleString('es-PE', { timeZone: 'America/Lima' })
    .replace(/[\/:]/g, '-')
    .replace(', ', '_');

  return `${descripcionBase} - CLONADO ${fechaHora}`;
}
