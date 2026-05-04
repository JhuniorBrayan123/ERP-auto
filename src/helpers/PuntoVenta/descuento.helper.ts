/**
 * Utilidades de cálculo de descuentos para PuntoVenta.
 *
 * Encapsula la lógica de cálculo para que los specs solo hagan assertions
 * contra valores esperados, sin implementar reglas de negocio inline.
 */

/**
 * Calcula el monto de descuento para un precio y porcentaje dados.
 * @returns Monto de descuento redondeado a 2 decimales.
 */
export function calcularDescuentoPorcentaje(subtotal: number, porcentaje: number): number {
    return Math.round((subtotal * porcentaje / 100) * 100) / 100;
}

/**
 * Calcula el total después de aplicar un descuento por porcentaje.
 */
export function calcularTotalConDescuento(subtotal: number, porcentaje: number): number {
    return Math.round((subtotal - calcularDescuentoPorcentaje(subtotal, porcentaje)) * 100) / 100;
}

/**
 * Calcula el IGV (18%) sobre un monto gravado.
 */
export function calcularIGV(montoGravado: number): number {
    return Math.round((montoGravado * 0.18) * 100) / 100;
}

/**
 * Calcula el total con IGV incluido.
 */
export function calcularTotalConIGV(montoGravado: number): number {
    return Math.round((montoGravado * 1.18) * 100) / 100;
}

/**
 * Calcula el monto de retención (3% por defecto).
 */
export function calcularRetencion(total: number, porcentaje: number = 3): number {
    return Math.round((total * porcentaje / 100) * 100) / 100;
}

/**
 * Calcula el monto de detracción según porcentaje configurado.
 */
export function calcularDetraccion(total: number, porcentaje: number): number {
    return Math.round((total * porcentaje / 100) * 100) / 100;
}
