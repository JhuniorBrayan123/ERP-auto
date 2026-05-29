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
