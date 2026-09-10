import type { APIRequestContext } from '@playwright/test';
import { env } from '../../../config/env';
import { withRetry } from '@utils/with-retry';

interface Almacen {
    Value: number;
    Label: string;
}

export class AlmacenesApi {
    private static cachedQuery: string | null = null;

    constructor(
        private readonly request: APIRequestContext,
        private readonly token: string,
    ) {}

    async obtenerAlmacenes(): Promise<Almacen[]> {
        const response = await withRetry(
            () => this.request.get(
                `${env.apiUrl}Logistica/api/v1/kardexs/total/combos/filtro`,
                { headers: { Authorization: `Bearer ${this.token}` } },
            ),
            { label: 'AlmacenesApi' },
        );

        if (!response.ok()) {
            throw new Error(
                `AlmacenesApi: Falló con status ${response.status()} – ${response.statusText()}`,
            );
        }

        const body = await response.json();
        return body.Almacenes;
    }

    async buildAlmacenesQuery(): Promise<string> {
        if (AlmacenesApi.cachedQuery) {
            return AlmacenesApi.cachedQuery;
        }

        const almacenes = await this.obtenerAlmacenes();
        const query = almacenes.map((a: Almacen) => `Almacenes=${a.Value}`).join('&');

        if (!query) {
            throw new Error('AlmacenesApi: No se encontraron almacenes para esta cuenta.');
        }

        AlmacenesApi.cachedQuery = query;
        return query;
    }

    static resetCache(): void {
        AlmacenesApi.cachedQuery = null;
    }
}
