import type {Page} from '@playwright/test';
import {NotaDebitoTargets} from '../../targets/notas-debito/NotaDebitoTargets';

export type MotivoNotaDebito =
    | 'Intereses por mora'
    | 'Aumento en el valor'
    | 'Otros conceptos'
    | 'Penalidades';


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
            case 'Penalidades':
                await NotaDebitoTargets.opcionPenalidades(page).click();
                break;
            case 'Otros conceptos':
                await NotaDebitoTargets.opcionOtrosConceptos(page).click();
                break;
        }
    };

    fn.displayName = `Seleccionar motivo ND: ${motivo}`;
    return fn;
};
