import type {APIRequestContext} from '@playwright/test';
import {env} from '../../../config/env';

export interface MovimientoCreado {
    id: number;
    codigo: string;
    correlativo: number;
    tipoMovimiento: string;
    estado: number;
    estadoDescripcion: string;
}

export class MovimientoApi {
    private readonly request: APIRequestContext;
    private readonly token: string;

    constructor(request: APIRequestContext, token: string) {
        this.request = request;
        this.token = token;
    }

    private buildIngresoUrl(): string {
        return `${env.apiUrl}Logistica/api/v1/movimientos/ingresos`;
    }

    private buildAuthHeaders(): Record<string, string> {
        return {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
        };
    }

    static parseMovimientoCreado(body: unknown): MovimientoCreado {
        const data = body as Record<string, any>;

        if (data?.Id == null || !data?.Codigo) {
            throw new Error(
                `MovimientoApi: respuesta inválida. Body: ${JSON.stringify(body)}`,
            );
        }

        return {
            id: Number(data.Id),
            codigo: String(data.Codigo),
            correlativo: Number(data.Correlativo),
            tipoMovimiento: String(data.TipoMovimiento),
            estado: Number(data.Estado),
            estadoDescripcion: String(data.EstadoDescripcion),
        };
    }

    async crearIngreso(payload: Record<string, unknown>): Promise<MovimientoCreado> {
        const response = await this.request.post(this.buildIngresoUrl(), {
            headers: this.buildAuthHeaders(),
            data: payload,
        });

        const body = await response.json().catch(() => null);

        if (!response.ok()) {
            throw new Error(
                `MovimientoApi: falló crearIngreso con status ${response.status()} - ${response.statusText()} - Body: ${JSON.stringify(body)}`,
            );
        }

        return MovimientoApi.parseMovimientoCreado(body);
    }
}