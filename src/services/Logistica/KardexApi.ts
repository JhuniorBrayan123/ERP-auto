import type {APIRequestContext} from '@playwright/test';
import {env} from '../../../config/env';

/**
 * Parámetros opcionales para la consulta de saldo por producto en Kardex.
 */
interface ObtenerSaldoParams {
    /** Código del producto a consultar (obligatorio). */
    codigoProducto: string;
    /** Substring para buscar el almacén en DescripcionAlmacen (default: 'AUTO'). */
    almacenFiltro?: string;
    /** Fecha de inicio del rango de consulta (default: '2020-01-01'). */
    fechaInicio?: string;
    /** Tipos de ítem a incluir en la query (default: [1, 6]). */
    tipoItem?: number[];
}

/**
 * Service Layer para el endpoint de Kardex del módulo de Logística.
 *
 * Encapsula la lógica de construcción de URL, autenticación,
 * parseo de respuesta y búsqueda de almacén.
 *
 * @example
 * ```ts
 * const kardexApi = new KardexApi(request, token);
 * const saldo = await kardexApi.obtenerSaldoPorProducto({
 *     codigoProducto: '121212',
 *     almacenFiltro: 'AUTO',
 *     codigo segu
 * });
 * ```
 */
export class KardexApi {
    private readonly request: APIRequestContext;
    private readonly token: string;
    private readonly almacenesQuery: string;

    constructor(request: APIRequestContext, token: string, almacenesQuery: string) {
        this.request = request;
        this.token = token;
        this.almacenesQuery = almacenesQuery;
    }

    // ─── Métodos privados ────────────────────────────────────────────

    /** Retorna la fecha actual en formato YYYY-MM-DD. */
    private getFechaHoy(): string {
        return new Date().toISOString().split('T')[0];
    }

    /**
     * Construye la query string de TipoItem a partir de un array.
     * Ejemplo: [1, 6] → 'TipoItem=1&TipoItem=6'
     */
    private buildTipoItemQuery(tipos: number[]): string {
        return tipos.map((t) => `TipoItem=${t}`).join('&');
    }

    /**
     * Construye la URL completa del endpoint filtroAvanzado del Kardex.
     */
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

    // ─── Métodos públicos ────────────────────────────────────────────

    /**
     * Consulta el Kardex y retorna el SaldoFinal del almacén indicado
     * para el producto especificado.
     *
     * Validaciones:
     *  - Lanza error si la respuesta HTTP no es exitosa.
     *  - Lanza error si `body.Data` no existe o está vacío.
     *  - Si no encuentra el almacén por filtro, usa el primer almacén
     *    como fallback y emite un warning en consola.
     *
     * @returns SaldoFinal del almacén encontrado (number).
     */
    async obtenerSaldoPorProducto(params: ObtenerSaldoParams): Promise<number> {
        const {
            codigoProducto,
            almacenFiltro = 'AUTO',
            fechaInicio = '2020-01-01',
            tipoItem = [1, 6],
        } = params;

        const url = this.buildUrl({codigoProducto, fechaInicio, tipoItem});

        const response = await this.request.get(url, {
            headers: {'Authorization': `Bearer ${this.token}`},
        });

        if (!response.ok()) {
            throw new Error(
                `KardexApi: La petición falló con status ${response.status()} – ${response.statusText()}`,
            );
        }

        const body = await response.json();

        if (!body.Data?.length) {
            throw new Error(
                `KardexApi: No se encontraron datos de Kardex para el producto "${codigoProducto}". ` +
                `Respuesta: ${JSON.stringify(body)}`,
            );
        }
        //console.log('BODY:', JSON.stringify(body, null, 2));

        const dataItem = body.Data[0];

// 🔹 Caso 1: producto sin variantes
        if (dataItem.Almacenes?.length) {
            const almacenEncontrado = dataItem.Almacenes.find(
                (a: { DescripcionAlmacen?: string }) =>
                    a.DescripcionAlmacen?.includes(almacenFiltro),
            );

            if (!almacenEncontrado) {
                console.warn(`No se encontró almacén "${almacenFiltro}"`);
            }

            return almacenEncontrado
                ? almacenEncontrado.SaldoFinal
                : dataItem.Almacenes[0].SaldoFinal;
        }

// 🔹 Caso 2: producto con variantes
        if (dataItem.Variaciones?.length) {
            const variacion = dataItem.Variaciones.find(
                (v: any) => v.CodigoItem === codigoProducto
            );

            if (!variacion?.Almacenes?.length) {
                throw new Error(`No hay almacenes para la variante "${codigoProducto}"`);
            }

            const almacenEncontrado = variacion.Almacenes.find(
                (a: { DescripcionAlmacen?: string }) =>
                    a.DescripcionAlmacen?.includes(almacenFiltro),
            );

            return almacenEncontrado
                ? almacenEncontrado.SaldoFinal
                : variacion.Almacenes[0].SaldoFinal;
        }

        throw new Error('Estructura inesperada en Kardex API');
    }
}