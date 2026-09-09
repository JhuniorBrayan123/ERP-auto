import type {APIRequestContext} from '@playwright/test';
import {env} from '../../../config/env';
import {
    type SunatPollResult,
    waitForEstadoSunatFinal,
    type WaitSunatOptions,
} from '@helpers/PuntoVenta/sunat-estados.helper';
import {CajasApi} from './CajasApi';

export class SunatEstadoApi {
    constructor(
        private readonly request: APIRequestContext,
        private readonly token: string,
    ) {
    }

    private deriveIdEntidadEmisoraFromToken(): number {
        const parts = this.token.split('.');
        if (parts.length < 2) {
            throw new Error('SunatEstadoApi: el token de autorización no es un JWT válido');
        }

        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/').padEnd(
            parts[1].length + (4 - (parts[1].length % 4)) % 4, '=',
        );
        const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf8')) as Record<string, unknown>;
        const scope = (payload?.scopes ?? payload?.scope) as {IdEntidadEmpresa?: number} | undefined;

        if (typeof scope?.IdEntidadEmpresa !== 'number' || scope.IdEntidadEmpresa <= 0) {
            throw new Error(
                'SunatEstadoApi: no se pudo determinar IdEntidadEmisora desde el token ' +
                '(falta scopes.IdEntidadEmpresa en el payload)',
            );
        }

        return scope.IdEntidadEmpresa;
    }

    private idsCajasCache: Promise<number[]> | null = null;

    private obtenerIdsCajas(): Promise<number[]> {
        if (!this.idsCajasCache) {
            const cajasApi = new CajasApi(this.request, this.token);
            this.idsCajasCache = cajasApi.obtenerCajas().then(cajas => cajas.map(c => c.id));
        }
        return this.idsCajasCache;
    }

    async obtenerEstado(idComprobanteERP: number): Promise<number> {
        const url = `${env.apiUrl}PuntoVenta/api/v2/DocumentosContables/Consultas`;
        const idsCajas = await this.obtenerIdsCajas();

        const hoy = new Date();
        const fechaHasta = hoy.toISOString().slice(0, 10);
        const desde = new Date(hoy);
        desde.setDate(desde.getDate() - 2);
        const fechaDesde = desde.toISOString().slice(0, 10);

        const response = await this.request.post(url, {
            headers: {Authorization: `Bearer ${this.token}`},
            data: {
                FechaDesde: `${fechaDesde}T00:00:00`,
                FechaHasta: `${fechaHasta}T23:59:59`,
                LogEstado: 1,
                IdEntidadEmisora: this.deriveIdEntidadEmisoraFromToken(),
                ListEstados: [1, 2, 3, 17, 14, 18],
                ListEstadosSunat: [2, 3, 4, 5, 10, 6, 8],
                Page: 0,
                Size: 50,
                TipoDocumentos: [
                    {Id: 1003}, {Id: 1004}, {Id: 2016}, {Id: 1005}, {Id: 1006},
                    {Id: 3005}, {Id: 3008}, {Id: 2011}, {Id: 3007},
                ],
                BusquedaCompuesta: '',
                Monedas: null,
                CondicionesPago: null,
                Series: null,
                Correlativo: null,
                NumeroDocumento: '',
                IdCliente: null,
                IdEntidad: null,
                UsuarioCreador: '',
                IdsSeriesPedidosCajas: [],
                IdsCajas: idsCajas,
                IdsFacturados: [],
                IdComprobanteVinculado: null,
                IncluyeBusquedaPedidosERP2: false,
                IdsTiendasVirtuales: [],
                EstadosEntregaStock: null,
            },
        });

        if (!response.ok()) {
            throw new Error(
                `SunatEstadoApi: falló con status ${response.status()} – ${response.statusText()}`,
            );
        }

        const body = await response.json();
        const data = body.ComprobantesCollectionResponse?.Data ?? [];
        // El id capturado al emitir (body.IdComprobante en EmisionPage.interceptarEmision)
        // corresponde a IdDocPuntoVenta, no a IdComprobanteERP — son campos distintos en
        // esta misma respuesta, y solo IdDocPuntoVenta está disponible al momento de emitir.
        const comprobante = data.find((c: any) => c.IdDocPuntoVenta === idComprobanteERP);

        if (!comprobante) {
            throw new Error(
                `SunatEstadoApi: No se encontró comprobante con IdDocPuntoVenta=${idComprobanteERP}`,
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
