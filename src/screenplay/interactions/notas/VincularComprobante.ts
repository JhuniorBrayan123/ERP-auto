import {expect, type Page} from '@playwright/test';
import {VincularComprobanteTargets} from '../../targets/common/VincularComprobanteTargets';
import {esperarCargaOverlaySiVisible} from '@utils/wait-helpers';

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
        await esperarCargaOverlaySiVisible(page);

        
        const selectorSerie = VincularComprobanteTargets.selectorSerie(page);
        const inputCorrelativo = VincularComprobanteTargets.inputCorrelativo(page);
        await expect(selectorSerie).toBeEnabled({timeout: 15_000});
        await expect(inputCorrelativo).toBeEnabled({timeout: 15_000});

        await selectorSerie.click();
        await page.getByText(datos.serie).click();
        await inputCorrelativo.click();
        await inputCorrelativo.fill(datos.correlativo);
        await VincularComprobanteTargets.btnBuscar(page).click();

        await expect(VincularComprobanteTargets.datosComprobanteCargado(page))
            .toBeVisible({timeout: 15_000});

    };

    fn.displayName = `Vincular comprobante ${datos.tipoDocumento} ${datos.serie}-${datos.correlativo}`;
    return fn;
};
