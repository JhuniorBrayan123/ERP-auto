import {Page} from '@playwright/test';
import {
    crearCotizacionSemilla,
    crearGuiaRemisionGuardada,
    crearBoletaEmitidaSemilla,
    crearBoletaEnEuro
} from '@helpers/PuntoVenta/semillas-emision.helper';
import type {ComprobanteInfo} from '@helpers/PuntoVenta/busqueda-comprobantes.data';

export class CrearComprobanteSemilla {
    static cotizacion() {
        const fn = async (page: Page): Promise<ComprobanteInfo> => {
            return await crearCotizacionSemilla(page);
        };
        return fn;
    }

    static guiaRemisionGuardada() {
        const fn = async (page: Page): Promise<ComprobanteInfo> => {
            return await crearGuiaRemisionGuardada(page);
        };
        return fn;
    }

    static boletaEmitida() {
        const fn = async (page: Page): Promise<ComprobanteInfo> => {
            return await crearBoletaEmitidaSemilla(page);
        };
        return fn;
    }

    static boletaEnEuro() {
        const fn = async (page: Page): Promise<ComprobanteInfo> => {
            return await crearBoletaEnEuro(page);
        };
        return fn;
    }
}
