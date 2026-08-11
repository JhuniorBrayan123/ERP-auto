import {expect, type Page} from '@playwright/test';
import {ComprobantePage} from '@pages/PuntoVenta/ComprobantePage';
import {NotaDebitoTargets} from '../../targets/notas-debito/NotaDebitoTargets';
import {BuscarComprobanteNotaDebito} from '../../interactions/notas/BuscarComprobanteNotaDebito';
import {type MotivoNotaDebito, SeleccionarMotivoNotaDebito} from '../../interactions/notas/SeleccionarMotivoNotaDebito';
import {LlenarMotivoNotaDebito} from '../../interactions/notas/LlenarMotivoTexto';
import {EmitirNotaDebitoConPago, type ResultadoEmisionNota} from '../../interactions/notas/EmitirNotaDebito';

export type {ResultadoEmisionNota};

export interface DatosCrearNotaDebitoVinculada {

    tipoDocumento: 'Factura' | 'Boleta';

    serie: string;

    correlativo: string;

    motivo: MotivoNotaDebito;

    textoMotivo: string;

    monto?: string;

    montoPorItem?: string;
}


export const CrearNotaDebitoConVinculacion = (datos: DatosCrearNotaDebitoVinculada) => {
    const fn = async (page: Page): Promise<ResultadoEmisionNota> => {

        const comprobantePage = new ComprobantePage(page);
        await comprobantePage.seleccionarNotaDebito();


        await expect(page.getByText(/nueva nota de débito/i)).toBeVisible({timeout: 10_000});


        await BuscarComprobanteNotaDebito({
            tipoDocumento: datos.tipoDocumento,
            serie: datos.serie,
            correlativo: datos.correlativo,
        })(page);

        await SeleccionarMotivoNotaDebito(datos.motivo)(page);

        await LlenarMotivoNotaDebito(datos.textoMotivo)(page);


        if (datos.monto && datos.motivo !== 'Aumento en el valor') {

            const inputMonto = NotaDebitoTargets.inputMonto(page);
            await inputMonto.click();
            await inputMonto.fill(datos.monto);
        } else if (datos.montoPorItem && datos.motivo === 'Aumento en el valor') {

            await NotaDebitoTargets.btnEditarItem(page).click();
            const inputMontoItem = NotaDebitoTargets.inputMontoItem(page);
            await inputMontoItem.click();
            await inputMontoItem.fill(datos.montoPorItem);
            await NotaDebitoTargets.btnAceptarItem(page).click();
        }


        return EmitirNotaDebitoConPago()(page);
    };

    fn.displayName = `Crear ND ${datos.motivo} desde ${datos.tipoDocumento} ${datos.serie}-${datos.correlativo}`;
    return fn;
};
