/**
 * Service Layer para polling de estado SUNAT.
 *
 * Usa el endpoint PuntoVenta/api/v2/DocumentosContables/Consultas
 * para consultar el campo IdestadoSunat del comprobante.
 *
 * NUNCA falla el test por estado SUNAT — solo reporta vía logs.
 */
import type { APIRequestContext } from '@playwright/test';
import { env } from '../../../config/env';
import {
    waitForEstadoSunatFinal,
    type WaitSunatOptions,
    type SunatPollResult,
} from '../../helpers/PuntoVenta/sunat-estados.helper';

export class SunatEstadoApi {
    constructor(
        private readonly request: APIRequestContext,
        private readonly token: string,
    ) {}

    /**
     * Consulta el estado SUNAT actual de un comprobante por su ID de ERP.
     * Busca en el endpoint de DocumentosContables/Consultas.
     *
     * @returns Código numérico del estado (ver EstadoSunat enum)
     */
    async obtenerEstado(idComprobanteERP: number): Promise<number> {
        const url = `${env.apiUrl}PuntoVenta/api/v2/DocumentosContables/Consultas`;

        const response = await this.request.get(url, {
            headers: { Authorization: `Bearer ${this.token}` },
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

    /**
     * Espera hasta que el comprobante alcance un estado SUNAT final.
     * Usa polling controlado con intervalos y timeout configurables.
     *
     * NUNCA falla el test:
     * - Si SUNAT acepta → log ✓ + aceptado: true
     * - Si SUNAT rechaza (5,6,7,9,10) → log ⚠️ + rechazado: true
     * - Si timeout → log ⚠️ + timeout: true
     */
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
