/**
 * Service Layer para consulta de cajas de venta.
 *
 * Endpoint: Finanzas/api/v1/cajas-ventas/aperturas
 * Permite identificar la caja correcta (caja-auto) y su estado de apertura.
 */
import type { APIRequestContext } from '@playwright/test';
import { env } from '../../../config/env';

export interface CajaVenta {
    id: number;
    nombre: string;
    codigo: string;
    /** Estado: 1 = Abierta, 3 = Cerrada */
    estado: number;
    idSucursal: number;
    sucursalDescripcion: string;
    almacenes: CajaAlmacen[];
    tipoDocDefecto: number;
    ultimoCuadreCajaId: number;
    ultimoCuadreCajaEstado: number;
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

    /**
     * Consulta las cajas de venta disponibles.
     *
     * @param sucursalId - ID de sucursal (default: 27747 = SUCURSAL VENTAS)
     */
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

        return data.map((item: any): CajaVenta => ({
            id: item.Id,
            nombre: item.Nombre,
            codigo: item.Codigo,
            estado: item.Estado,
            idSucursal: item.IdSucursal,
            sucursalDescripcion: item.Sucursal?.Descripcion ?? '',
            almacenes: (item.Almacenes ?? []).map((a: any) => ({
                idAlmacen: a.IdAlmacen,
                nombreAlmacen: a.NombreAlmacen,
                defecto: a.Defecto,
            })),
            tipoDocDefecto: item.IdTipoDocDefecto,
            ultimoCuadreCajaId: item.UltimoCuadreCaja?.Id ?? 0,
            ultimoCuadreCajaEstado: item.UltimoCuadreCaja?.Estado ?? 0,
        }));
    }

    /**
     * Busca la caja por nombre (ej: 'caja-auto').
     */
    async buscarCajaPorNombre(nombre: string): Promise<CajaVenta | undefined> {
        const cajas = await this.obtenerCajas();
        return cajas.find(c => c.nombre.toLowerCase().includes(nombre.toLowerCase()));
    }

    /**
     * Verifica si una caja está abierta (Estado = 1 y cuadre abierto).
     */
    async estaCajaAbierta(cajaId: number): Promise<boolean> {
        const cajas = await this.obtenerCajas();
        const caja = cajas.find(c => c.id === cajaId);
        if (!caja) return false;
        return caja.estado === 1 && caja.ultimoCuadreCajaEstado === 1;
    }
}
