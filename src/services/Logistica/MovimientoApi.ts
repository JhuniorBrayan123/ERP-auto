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

    private parseMovimientoCreado(body: any): MovimientoCreado {
        if (!body?.Id || !body?.Codigo) {
            throw new Error(
                `MovimientoApi: respuesta inválida. Body: ${JSON.stringify(body)}`
            );
        }

        return {
            id: body.Id,
            codigo: body.Codigo,
            correlativo: body.Correlativo,
            tipoMovimiento: body.TipoMovimiento,
            estado: body.Estado,
            estadoDescripcion: body.EstadoDescripcion,
        };
    }

    async crearIngreso(payload: Record<string, unknown>): Promise<MovimientoCreado> {
        const response = await this.request.post(this.buildIngresoUrl(), {
            headers: this.buildAuthHeaders(),
            data: payload,
        });

        if (!response.ok()) {
            throw new Error(
                `MovimientoApi: falló crearIngreso con status ${response.status()} - ${response.statusText()}`
            );
        }

        const body = await response.json();
        return this.parseMovimientoCreado(body);
    }
}