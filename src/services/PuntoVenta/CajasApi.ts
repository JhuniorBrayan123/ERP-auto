import type { APIRequestContext } from '@playwright/test';
import { env } from '../../../config/env';
import type { CajaVentaRaw, AlmacenCajaRaw } from '../../types/api-responses.types';

export interface MontoActualCaja {
    idMoneda: number;
    descripcionMoneda: string;
    montoActual: number;
    descripcionTipo: string;
}

export interface CajaVenta {
    id: number;
    nombre: string;
    codigo: string;
    
    estado: number;
    idSucursal: number;
    sucursalDescripcion: string;
    almacenes: CajaAlmacen[];
    tipoDocDefecto: number;
    ultimoCuadreCajaId: number;
    ultimoCuadreCajaEstado: number;
    montosActualesPorMoneda: MontoActualCaja[];
}

export interface CajaAlmacen {
    idAlmacen: number;
    nombreAlmacen: string;
    defecto: number;
}

export class CajasApi {
    constructor(
        private readonly request: APIRequestContext,
        private readonly token: string,
    ) {}

    async obtenerCajas(sucursalId: number = 27747): Promise<CajaVenta[]> {
        const url = [
            `${env.apiUrl}Finanzas/api/v1/cajas-ventas/aperturas`,
            `?sucursales=${sucursalId}`,
            `&pagina=0&regxpag=100&estado=1&categoria=0&idCaja=0`,
        ].join('');

        const response = await this.request.get(url, {
            headers: { Authorization: `Bearer ${this.token}` },
        });

        if (!response.ok()) {
            throw new Error(
                `CajasApi: falló con status ${response.status()} – ${response.statusText()}`,
            );
        }

        const body = await response.json();
        const data = body.Data ?? [];

        return data.map((item: CajaVentaRaw): CajaVenta => ({
            id: item.Id,
            nombre: item.Nombre,
            codigo: item.Codigo,
            estado: item.Estado,
            idSucursal: item.IdSucursal,
            sucursalDescripcion: item.Sucursal?.Descripcion ?? '',
            almacenes: (item.Almacenes ?? []).map((a: AlmacenCajaRaw) => ({
                idAlmacen: a.IdAlmacen,
                nombreAlmacen: a.NombreAlmacen,
                defecto: a.Defecto,
            })),
            tipoDocDefecto: item.IdTipoDocDefecto,
            ultimoCuadreCajaId: item.UltimoCuadreCaja?.Id ?? 0,
            ultimoCuadreCajaEstado: item.UltimoCuadreCaja?.Estado ?? 0,
            montosActualesPorMoneda: (item.UltimoCuadreCaja?.MontoActualxMoneda ?? []).map((m) => ({
                idMoneda: m.IdMoneda ?? 0,
                descripcionMoneda: m.DescripcionMoneda ?? '',
                montoActual: m.MontoActual ?? 0,
                descripcionTipo: m.DescripcionTipo ?? '',
            })),
        }));
    }

    async obtenerMontoActualSoles(sucursalId: number = 27747): Promise<number> {
        const cajas = await this.obtenerCajas(sucursalId);
        const caja = cajas.find(c => c.estado === 1) ?? cajas[0];
        if (!caja) {
            throw new Error(
                `CajasApi: no se encontró ninguna caja abierta para la sucursal ${sucursalId}`,
            );
        }

        const soles = caja.montosActualesPorMoneda.find(m => m.idMoneda === 1);
        if (!soles) {
            throw new Error(
                `CajasApi: la caja "${caja.nombre}" no expone un monto actual en soles (IdMoneda 1). ` +
                `Monedas disponibles: ${caja.montosActualesPorMoneda.map(m => m.descripcionMoneda).join(', ') || 'ninguna'}`,
            );
        }

        return soles.montoActual;
    }

    async buscarCajaPorNombre(nombre: string): Promise<CajaVenta | undefined> {
        const cajas = await this.obtenerCajas();
        return cajas.find(c => c.nombre.toLowerCase().includes(nombre.toLowerCase()));
    }

    async estaCajaAbierta(cajaId: number): Promise<boolean> {
        const cajas = await this.obtenerCajas();
        const caja = cajas.find(c => c.id === cajaId);
        if (!caja) return false;
        return caja.estado === 1 && caja.ultimoCuadreCajaEstado === 1;
    }
}
