import type {APIRequestContext} from '@playwright/test';
import {env} from '../../../config/env';
import {
    type SunatPollResult,
    waitForEstadoSunatFinal,
    type WaitSunatOptions,
} from '@helpers/PuntoVenta/sunat-estados.helper';

export class SunatEstadoApi {
    constructor(
        private readonly request: APIRequestContext,
        private readonly token: string,
    ) {
    }

    async obtenerEstado(idComprobanteERP: number): Promise<number> {
        const url = `${env.apiUrl}PuntoVenta/api/v2/DocumentosContables/Consultas`;

        const response = await this.request.get(url, {
            headers: {Authorization: `Bearer ${this.token}`},
        });

        if (!response.ok()) {
            throw new Error(
                `SunatEstadoApi: falló con status ${response.status()} – ${response.statusText()}`,
            );
        }

        const body = await response.json();
        const data = body.ComprobantesCollectionResponse?.Data ?? [];
        const comprobante = data.find((c: any) => c.IdComprobanteERP === idComprobanteERP);

        if (!comprobante) {
            throw new Error(
                `SunatEstadoApi: No se encontró comprobante con IdComprobanteERP=${idComprobanteERP}`,
            );
        }

        return comprobante.IdestadoSunat;
    }

    async esperarEstadoFinal(
        idComprobanteERP: number,
        options?: WaitSunatOptions,
    ): Promise<SunatPollResult> {
        return waitForEstadoSunatFinal(
            () => this.obtenerEstado(idComprobanteERP),
            options,
        );
    }
}
