import {expect, type Page} from '@playwright/test';
import {ClientePage} from '@pages/PuntoVenta/ClientePage';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import {ComprobantePage} from '@pages/PuntoVenta/ComprobantePage';
import type {DatosCliente, ItemVenta, TipoComprobante} from '@app-types/emision.types';

export interface DatosComprobanteOrigen {
    tipoComprobante: TipoComprobante;
    cliente: DatosCliente & { textoSelector?: string };
    item: ItemVenta;
}

export interface ResultadoComprobanteOrigen {
    serie: string;
    correlativo: string;
    comprobanteId: number;
    numero: string;
}

export const EmitirComprobanteOrigen = (datos: DatosComprobanteOrigen) => {
    const fn = async (page: Page): Promise<ResultadoComprobanteOrigen> => {
        const emisionPage = new EmisionPage(page);
        const clientePage = new ClientePage(page);
        const comprobantePage = new ComprobantePage(page);

        await comprobantePage.seleccionarTipoComprobante(datos.tipoComprobante as TipoComprobante);

        await clientePage.buscarCliente(datos.cliente.documento);
        await clientePage.seleccionarClientePorTexto(
            datos.cliente.textoSelector || datos.cliente.nombre
        );
        await emisionPage.buscarItem(datos.item.codigo);
        await emisionPage.seleccionarItem(datos.item.nombre);
        const resultado = await emisionPage.emitirConEfectivoExacto();
        await expect(page.getByText('¡Buen trabajo!')).toBeVisible();
        await emisionPage.clickNuevaVenta();

        return {
            serie: resultado.serie,
            correlativo: resultado.correlativo,
            comprobanteId: resultado.comprobanteId,
            numero: `${resultado.serie}-${String(resultado.correlativo).padStart(8, '0')}`,
        };
    };

    fn.displayName = `Emitir ${datos.tipoComprobante} origen: cliente ${datos.cliente.nombre}, ítem ${datos.item.nombre}`;
    return fn;
};
