export function calcularDescuentoPorcentaje(subtotal: number, porcentaje: number): number {
    return Math.round((subtotal * porcentaje / 100) * 100) / 100;
}

export function calcularTotalConDescuento(subtotal: number, porcentaje: number): number {
    return Math.round((subtotal - calcularDescuentoPorcentaje(subtotal, porcentaje)) * 100) / 100;
}

export function calcularIGV(montoGravado: number): number {
    return Math.round((montoGravado * 0.18) * 100) / 100;
}

export function calcularTotalConIGV(montoGravado: number): number {
    return Math.round((montoGravado * 1.18) * 100) / 100;
}

export function calcularRetencion(total: number, porcentaje: number = 3): number {
    return Math.round((total * porcentaje / 100) * 100) / 100;
}

export function calcularDetraccion(total: number, porcentaje: number): number {
    return Math.round((total * porcentaje / 100) * 100) / 100;
}
