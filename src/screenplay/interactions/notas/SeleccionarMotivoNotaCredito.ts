import type {Page} from '@playwright/test';
import {NotaCreditoTargets} from '../../targets/notas-credito/NotaCreditoTargets';

export type MotivoNotaCredito =
    | 'Anulación de la operación'
    | 'Anulación por error en el RUC'
    | 'Devolución Total'
    | 'Devolución por ítem'
    | 'Descuento global'
    | 'Descuento por ítem'
    | 'Corrección por error en la descripción'
    | 'Bonificación'
    | 'Disminución en el valor'
    | 'Otros Conceptos'
    | 'Ajustes de operaciones de exportación';


export const SeleccionarMotivoNotaCredito = (motivo: MotivoNotaCredito) => {
    const fn = async (page: Page): Promise<void> => {

        await NotaCreditoTargets.selectorTipoNota(page).click();


        switch (motivo) {
            case 'Anulación de la operación':
                await NotaCreditoTargets.opcionAnulacion(page).click();
                break;
            case 'Devolución Total':
                await NotaCreditoTargets.opcionDevolucionTotal(page).click();
                break;
            case 'Devolución por ítem':
                await NotaCreditoTargets.opcionDevolucionPorItem(page).click();
                break;
            case 'Anulación por error en el RUC':
                await NotaCreditoTargets.opcionAnulacionPorErrorRUC(page).click();
                break;
            case 'Descuento global':
                await NotaCreditoTargets.opcionDescuentoGlobal(page).click();
                break;
            case 'Descuento por ítem':
                await NotaCreditoTargets.opcionDescuentoPorItem(page).click();
                break;
            case 'Corrección por error en la descripción':
                await NotaCreditoTargets.opcionCorreccionDescripcion(page).click();
                break;
            case 'Bonificación':
                await NotaCreditoTargets.opcionBonificacion(page).click();
                break;
            case 'Disminución en el valor':
                await NotaCreditoTargets.opcionDisminucionEnElValor(page).click();
                break;
            case 'Otros Conceptos':
                await NotaCreditoTargets.opcionOtrosConceptos(page).click();
                break;
            case 'Ajustes de operaciones de exportación':
                await NotaCreditoTargets.opcionAjustesExportacion(page).click();
                break;
        }
    };

    fn.displayName = `Seleccionar motivo NC: ${motivo}`;
    return fn;
};
