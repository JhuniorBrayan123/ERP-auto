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

    async obtenerCajas(sucursalId?: number): Promise<CajaVenta[]> {
        const id = this.resolveSucursalId(sucursalId);
        const url = [
            `${env.apiUrl}Finanzas/api/v1/cajas-ventas/aperturas`,
            `?sucursales=${id}`,
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

    /**
     * Busca entre las cajas abiertas la que corresponde al flujo.
     * Si se indica `nombreCaja`, prioriza la caja cuyo nombre coincida (la caja
     * activa del punto de venta). De lo contrario usa la primera abierta.
     */
    private seleccionarCajaActiva(cajas: CajaVenta[], nombreCaja?: string): CajaVenta | undefined {
        if (nombreCaja) {
            const match = cajas.find(
                c => c.nombre?.trim().toLowerCase().includes(nombreCaja.trim().toLowerCase()),
            );
            if (match) return match;
        }
        return cajas.find(c => c.estado === 1) ?? cajas[0];
    }

    async obtenerMontoActualSoles(sucursalId?: number, nombreCaja?: string): Promise<number> {
        const id = this.resolveSucursalId(sucursalId);
        const cajas = await this.obtenerCajas(id);
        const caja = this.seleccionarCajaActiva(cajas, nombreCaja);
        if (!caja) {
            throw new Error(
                `CajasApi: no se encontró ninguna caja abierta para la sucursal ${id}`,
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

    /**
     * Resuelve el id de sucursal a usar al consultar las cajas.
     * - Si se pasa `sucursalId` explícito y mayor que 0, se usa ese.
     * - En caso contrario, se deriva dinámicamente del payload del JWT de autorización
     *   (`scopes.Sucursales[0]`, con fallback a `scopes.IdEntidadEmpresa`).
     * De esta forma la sucursal activa proviene de la sesión (token) y no está
     * hardcodeada, funcionando en cualquier entorno/usuario.
     */
    private resolveSucursalId(sucursalId?: number): number {
        if (sucursalId && sucursalId > 0) return sucursalId;
        return this.deriveSucursalIdFromToken();
    }

    private deriveSucursalIdFromToken(): number {
        const parts = this.token.split('.');
        if (parts.length < 2) {
            throw new Error('CajasApi: el token de autorización no es un JWT válido');
        }

        const payload = this.decodeJwtPayload(parts[1]);
        // El JWT de sesión expone las sucursales en la clave `scopes` (plural).
        // Se contempla también `scope` (singular) por robustez ante distintos emisores.
        const scope = (payload?.scopes ?? payload?.scope) as
            | { Sucursales?: number[]; IdEntidadEmpresa?: number }
            | undefined;
        const sucursales = scope?.Sucursales;
        if (Array.isArray(sucursales) && sucursales.length > 0 && sucursales[0] > 0) {
            return sucursales[0];
        }

        const idEntidad = scope?.IdEntidadEmpresa;
        if (typeof idEntidad === 'number' && idEntidad > 0) {
            return idEntidad;
        }

        throw new Error(
            'CajasApi: no se pudo determinar la sucursal desde el token de autorización ' +
                '(falta scopes.Sucursales o scopes.IdEntidadEmpresa en el payload)',
        );
    }

    private decodeJwtPayload(b64urlSegment: string): Record<string, unknown> {
        let base64 = b64urlSegment.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4 !== 0) {
            base64 += '=';
        }

        const json = Buffer.from(base64, 'base64').toString('utf8');
        try {
            return JSON.parse(json) as Record<string, unknown>;
        } catch {
            throw new Error('CajasApi: no se pudo decodificar el payload del token');
        }
    }
}
