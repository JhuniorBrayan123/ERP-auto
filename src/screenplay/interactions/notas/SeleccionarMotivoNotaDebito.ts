import type { Page } from '@playwright/test';
import { NotaDebitoTargets } from '../../targets/notas-debito/NotaDebitoTargets';

export type MotivoNotaDebito =
  | 'Intereses por mora'
  | 'Aumento en el valor'
  | 'Penalidades/ otros conceptos';

/**
 * Interaction: Seleccionar Motivo de Nota de Débito.
 *
 * Abre el selector de tipo de ND y elige el motivo indicado.
 * Responsabilidad única: operar el dropdown de tipo de ND.
 */
export const SeleccionarMotivoNotaDebito = (motivo: MotivoNotaDebito) => {
  const fn = async (page: Page): Promise<void> => {

    await NotaDebitoTargets.selectorTipoNota(page).click();

    switch (motivo) {
      case 'Intereses por mora':
        await NotaDebitoTargets.opcionInteresMora(page).click();
        break;
      case 'Aumento en el valor':
        await NotaDebitoTargets.opcionAumentoValor(page).click();
        break;
      case 'Penalidades/ otros conceptos':
        await NotaDebitoTargets.opcionPenalidades(page).click();
        break;
    }
  };

  fn.displayName = `Seleccionar motivo ND: ${motivo}`;
  return fn;
};
