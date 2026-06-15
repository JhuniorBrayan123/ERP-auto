import {expect, type Page} from '@playwright/test';
import {VincularComprobanteTargets} from '../../targets/common/VincularComprobanteTargets';

export type TipoDocumentoOrigen = 'Factura' | 'Boleta';

export interface DatosVinculacion {
    tipoDocumento: TipoDocumentoOrigen;
    serie: string;
    correlativo: string;
}

export const VincularComprobante = (datos: DatosVinculacion) => {
    const fn = async (page: Page): Promise<void> => {

        await VincularComprobanteTargets.btnVincularComprobante(page).click();
        await VincularComprobanteTargets.opcionTipoDocumento(page, datos.tipoDocumento).click();
        await VincularComprobanteTargets.selectorTipoDocumento(page).click();
        await page.getByText(datos.serie).click();
        await VincularComprobanteTargets.inputCorrelativo(page).click();
        await VincularComprobanteTargets.inputCorrelativo(page).fill(datos.correlativo);
        await VincularComprobanteTargets.btnBuscar(page).click();

        await expect(VincularComprobanteTargets.datosComprobanteCargado(page))
            .toBeVisible({timeout: 15_000});

    };

    fn.displayName = `Vincular comprobante ${datos.tipoDocumento} ${datos.serie}-${datos.correlativo}`;
    return fn;
};
