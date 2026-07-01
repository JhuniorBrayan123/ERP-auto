import type {APIRequestContext} from '@playwright/test';
import {env} from '../../../config/env';
import type {KardexAlmacenRaw, KardexVariacionRaw} from '../../types/api-responses.types';

interface ObtenerSaldoParams {

    codigoProducto: string;

    almacenFiltro?: string;

    fechaInicio?: string;

    tipoItem?: number[];
}

export class KardexApi {
    private readonly request: APIRequestContext;
    private readonly token: string;
    private readonly almacenesQuery: string;

    constructor(request: APIRequestContext, token: string, almacenesQuery: string) {
        this.request = request;
        this.token = token;
        this.almacenesQuery = almacenesQuery;
    }

    private getFechaHoy(): string {
        return new Date().toISOString().split('T')[0];
    }

    private buildTipoItemQuery(tipos: number[]): string {
        return tipos.map((t) => `TipoItem=${t}`).join('&');
    }

    private buildUrl(params: Required<Pick<ObtenerSaldoParams, 'codigoProducto' | 'fechaInicio' | 'tipoItem'>>): string {
        const fechaFin = this.getFechaHoy();
        const tipoItemQuery = this.buildTipoItemQuery(params.tipoItem);

        return [
            `${env.apiUrl}Logistica/api/v1/kardexs/total/filtroAvanzado`,
            `?fechaInicio=${params.fechaInicio}`,
            `&fechaFin=${fechaFin}`,
            `&tipoSaldoInicial=2`,
            `&pagina=1`,
            `&tamanio=10`,
            `&${this.almacenesQuery}`,
            `&${tipoItemQuery}`,
            `&BusquedaCompuesta=${params.codigoProducto}`,
        ].join('');
    }

    async obtenerSaldoPorProducto(params: ObtenerSaldoParams): Promise<number> {
        const {
            codigoProducto: rawCodigo,
            almacenFiltro = 'AUTO',
            fechaInicio = '2020-01-01',
            tipoItem = [1, 6],
        } = params;

        const codigoProducto = rawCodigo.replace(/-/g, '');

        const url = this.buildUrl({codigoProducto, fechaInicio, tipoItem});

        const maxRetries = 3;
        let body: any;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const response = await this.request.get(url, {
                headers: {'Authorization': `Bearer ${this.token}`},
            });

            if (response.ok()) {
                body = await response.json();
                break; 
            }

            const status = response.status();

            
            if (status >= 500 && status < 600 && attempt < maxRetries) {
                console.warn(`⚠ [KardexApi] Error ${status} al consultar saldo de "${codigoProducto}". Reintento ${attempt} en 2s...`);
                
                await new Promise(resolve => setTimeout(resolve, 2000));
                continue;
            }

            
            throw new Error(
                `KardexApi: La petición falló con status ${status} – ${response.statusText()}`,
            );
        }

        if (!body.Data?.length) {
            throw new Error(
                `KardexApi: No se encontraron datos de Kardex para el producto "${codigoProducto}". ` +
                `Respuesta: ${JSON.stringify(body)}`,
            );
        }

        const dataItem = body.Data[0];

        if (dataItem.Almacenes?.length) {
            const almacenEncontrado = dataItem.Almacenes.find(
                (a: KardexAlmacenRaw) =>
                    a.DescripcionAlmacen?.includes(almacenFiltro),
            );

            if (!almacenEncontrado) {
                console.warn(`No se encontró almacén "${almacenFiltro}"`);
            }

            return almacenEncontrado
                ? almacenEncontrado.SaldoFinal
                : dataItem.Almacenes[0].SaldoFinal;
        }

        if (dataItem.Variaciones?.length) {
            const variacion = dataItem.Variaciones.find(
                (v: KardexVariacionRaw) => v.CodigoItem === codigoProducto
            );

            if (!variacion?.Almacenes?.length) {
                throw new Error(`No hay almacenes para la variante "${codigoProducto}"`);
            }

            const almacenEncontrado = variacion.Almacenes.find(
                (a: KardexAlmacenRaw) =>
                    a.DescripcionAlmacen?.includes(almacenFiltro),
            );

            return almacenEncontrado
                ? almacenEncontrado.SaldoFinal
                : variacion.Almacenes[0].SaldoFinal;
        }

        throw new Error('Estructura inesperada en Kardex API');
    }
}