import {type Page} from '@playwright/test';
import {SeleccionarTipoComprobante} from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import {BuscarYSeleccionarCliente} from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import {BuscarYAgregarProducto} from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import {EmitirCotizacionVF, type ResultadoEmisionVF} from '@screenplay/interactions/cotizacion/EmitirCotizacionVF';
import {LlenarObservaciones} from '@screenplay/interactions/common/LlenarObservaciones';
import {CotizacionTargets} from '@screenplay/targets/cotizacion/CotizacionTargets';
import {CotizacionOpcionesPage} from '@pages/PuntoVenta/CotizacionOpcionesPage';
import type {DatosCliente, ItemVenta} from '@app-types/emision.types';

export interface DatosCotizacionVF {
    cliente?: DatosCliente & { textoSelector?: string };
    items: ItemVenta[];
    validezOferta?: string;
    igv?: string;
    observaciones?: string;
    incluirImagenes?: boolean;
    incluirDescripcion?: boolean;
    clienteSinDoc?: { nombre: string; direccion: string };
}

export const CrearCotizacionVF = (datos: DatosCotizacionVF) => {
    const fn = async (page: Page): Promise<ResultadoEmisionVF> => {
        await SeleccionarTipoComprobante('COTIZACION')(page);

        if (datos.clienteSinDoc) {
            await CotizacionTargets.switchClienteSinDoc(page).click();
            await CotizacionTargets.inputRazonSocialSinDoc(page).fill(datos.clienteSinDoc.nombre);
            await CotizacionTargets.inputDireccionSinDoc(page).fill(datos.clienteSinDoc.direccion);
        } else if (datos.cliente) {
            await BuscarYSeleccionarCliente(datos.cliente)(page);
        }

        const opcionesPage = new CotizacionOpcionesPage(page);
        if (datos.validezOferta) {
            await opcionesPage.seleccionarVigencia(datos.validezOferta);
        }

        if (datos.igv) {
            await opcionesPage.seleccionarIGV(datos.igv);
        }

        if (datos.incluirImagenes) {
            await CotizacionTargets.switchIncluirImagenes(page).click();
        }
        if (datos.incluirDescripcion) {
            await CotizacionTargets.switchIncluirDescripcion(page).click();
        }

        for (const item of datos.items) {
            await BuscarYAgregarProducto(item)(page);
        }

        if (datos.observaciones) {
            await LlenarObservaciones(datos.observaciones)(page);
        }

        const resultado = await EmitirCotizacionVF()(page);

        return resultado;
    };

    fn.displayName = datos.cliente
        ? `Crear Cotización VF — ${datos.cliente.nombre}`
        : datos.clienteSinDoc
            ? `Crear Cotización VF — ${datos.clienteSinDoc.nombre} (sin doc)`
            : 'Crear Cotización VF — sin cliente';
    return fn;
};
