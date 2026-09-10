import type { APIRequestContext } from '@playwright/test';
import { env } from '../../../config/env';
import { withRetry } from '@utils/with-retry';

export interface ComprobanteConsulta {
    idComprobanteERP: number;
    idDocPuntoVenta: number;
    tipoDocDescripcion: string;
    estadoDescripcion: string;
    idEstadoComprobante: number;
    idEstadoSunat: number;
    serieDescripcion: string;
    correlativoDocumento: number;
    numeroDocumentoFormateado: string;
    montoSubTotal: number;
    montoIGV: number;
    montoTotal: number;
    fechaEmision: string;
    receptorRazonSocial: string;
    receptorNumeroDocumento: string;
    cajaNombre: string;
    idCaja: number;
}

export class ComprobanteApi {
    constructor(
        private readonly request: APIRequestContext,
        private readonly token: string,
    ) {}

    private buildAuthHeaders(): Record<string, string> {
        return {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
        };
    }

    async consultarComprobantes(filtros?: {
        idCaja?: number;
        pagina?: number;
        tamanio?: number;
    }): Promise<ComprobanteConsulta[]> {
        const params = new URLSearchParams();
        if (filtros?.idCaja) params.set('idCaja', String(filtros.idCaja));
        params.set('pagina', String(filtros?.pagina ?? 0));
        params.set('tamanio', String(filtros?.tamanio ?? 50));

        const url = `${env.apiUrl}PuntoVenta/api/v2/DocumentosContables/Consultas?${params}`;

        const response = await withRetry(
            () => this.request.get(url, {
                headers: this.buildAuthHeaders(),
            }),
            { label: 'ComprobanteApi' },
        );

        if (!response.ok()) {
            throw new Error(
                `ComprobanteApi: falló con status ${response.status()} – ${response.statusText()}`,
            );
        }

        const body = await response.json();
        const data = body.ComprobantesCollectionResponse?.Data ?? [];

        return data.map((item: any): ComprobanteConsulta => ({
            idComprobanteERP: item.IdComprobanteERP,
            idDocPuntoVenta: item.IdDocPuntoVenta ?? item.Id,
            tipoDocDescripcion: item.TipoDocDescripcion,
            estadoDescripcion: item.EstadoDescripcion,
            idEstadoComprobante: item.IdEstadoComprobante,
            idEstadoSunat: item.IdestadoSunat,
            serieDescripcion: item.SerieDescripcion,
            correlativoDocumento: item.CorrelativoDocumento,
            numeroDocumentoFormateado: item.NumeroDocumentoFormateado,
            montoSubTotal: item.MontoSubTotal,
            montoIGV: item.MontoIGV,
            montoTotal: item.MontoTotal,
            fechaEmision: item.FechaEmision,
            receptorRazonSocial: item.ReceptorRazonSocial,
            receptorNumeroDocumento: item.ReceptorNumeroDocumento,
            cajaNombre: item.CajaDescripcion,
            idCaja: item.IdCaja,
        }));
    }

    async obtenerUltimoComprobante(): Promise<ComprobanteConsulta> {
        const comprobantes = await this.consultarComprobantes({ tamanio: 1 });
        if (!comprobantes.length) {
            throw new Error('ComprobanteApi: No hay comprobantes emitidos.');
        }
        return comprobantes[0];
    }

    async obtenerEstadoSunat(idComprobanteERP: number): Promise<number> {
        const comprobantes = await this.consultarComprobantes();
        const comprobante = comprobantes.find(c => c.idComprobanteERP === idComprobanteERP);
        if (!comprobante) {
            throw new Error(`ComprobanteApi: No se encontró comprobante con ID ${idComprobanteERP}`);
        }
        return comprobante.idEstadoSunat;
    }
}
