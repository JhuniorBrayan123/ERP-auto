/**
 * Tipos extendidos de cliente para uso en PuntoVenta.
 *
 * Extiende DatosCliente con campos opcionales usados por la UI de la caja
 * (textoSelector para adelantos, etc.).
 *
 * Reemplaza los `any` en EmisionPage.llenarDatosOpcionales y abrirAdelantos.
 */
import type {DatosCliente} from './emision.types';

/**
 * Cliente con texto de selector para la UI de la caja.
 * Usado en adelantos y datos opcionales donde el locator de selección
 * requiere un texto completo diferente al nombre del cliente.
 */
export interface DatosClienteConSelector extends DatosCliente {
    /** Texto completo para locator de selección en UI (card de entidad) */
    textoSelector?: string;
}
