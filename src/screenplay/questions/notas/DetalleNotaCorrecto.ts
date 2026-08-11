import {expect, type Page} from '@playwright/test';
import {BusquedaComprobantesTargets} from '../../targets/common/BusquedaComprobantesTargets';


export interface DatosEsperadosDetalleNC {
    tipoDocumento: 'Nota de crédito electrónica';
    tieneComprobanteVinculado?: boolean;
    esSinReferencia?: boolean;
    motivoEsperado?: string;
    clienteEsperado?: string;
}

export interface DatosEsperadosDetalleND {
    tipoDocumento: 'Nota de débito electrónica';
    tieneComprobanteVinculado?: boolean;
    tipoNota?: string;
    motivoEsperado?: string;
    rucEsperado?: string;
    nombreEsperado?: string;
}

export const DetalleNotaCreditoCorrecto = (
    popup: Page,
    datos: DatosEsperadosDetalleNC
) => {
    const fn = async (_page: Page): Promise<void> => {
        await expect(
            BusquedaComprobantesTargets.tituloNotaCreditoDetalle(popup)
        ).toBeVisible();

        if (datos.tieneComprobanteVinculado) {
            await expect(
                BusquedaComprobantesTargets.textoComprobanteVinculado(popup)
            ).toBeVisible();
        }

        if (datos.esSinReferencia) {
            await expect(
                BusquedaComprobantesTargets.textoSinReferencia(popup)
            ).toBeVisible();
        }

        if (datos.motivoEsperado) {
            await expect(
                BusquedaComprobantesTargets.contenedorDetalleComprobante(popup)
            ).toContainText(datos.motivoEsperado);
        }
        if (datos.clienteEsperado) {
            await expect(
                BusquedaComprobantesTargets.contenedorDetalleComprobante(popup)
            ).toContainText(datos.clienteEsperado);
        }
    };

    fn.displayName = 'Verificar detalle de nota de crédito en popup';
    return fn;
};

export const DetalleNotaDebitoCorrecto = (
    popup: Page,
    datos: DatosEsperadosDetalleND
) => {
    const fn = async (_page: Page): Promise<void> => {
        await expect(
            BusquedaComprobantesTargets.tituloNotaDebitoDetalle(popup)
        ).toBeVisible();

        if (datos.tieneComprobanteVinculado) {
            await expect(
                BusquedaComprobantesTargets.textoComprobanteVinculado(popup)
            ).toBeVisible();
        }

        if (datos.tipoNota) {
            await expect(
                BusquedaComprobantesTargets.contenedorDetalleComprobante(popup)
            ).toContainText(datos.tipoNota);
        }

        if (datos.motivoEsperado) {
            await expect(
                BusquedaComprobantesTargets.contenedorDetalleComprobante(popup)
            ).toContainText(datos.motivoEsperado);
        }

        if (datos.rucEsperado) {
            await expect(
                BusquedaComprobantesTargets.contenedorDetalleComprobante(popup)
            ).toContainText(datos.rucEsperado);
        }

        if (datos.nombreEsperado) {
            await expect(
                BusquedaComprobantesTargets.contenedorDetalleComprobante(popup)
            ).toContainText(datos.nombreEsperado);
        }
    };

    fn.displayName = 'Verificar detalle de nota de débito en popup';
    return fn;
};
