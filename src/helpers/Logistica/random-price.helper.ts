/**
 * Helper para generar precios aleatorios para tests de edición.
 *
 * Genera un número con:
 * - Parte entera: entre 2 y 3 dígitos (10 a 999)
 * - Parte decimal: entre 2 y 4 dígitos (0.01 a 0.9999)
 *
 * Ejemplo de salida: "42.5731", "150.39", "8.1234"
 */

/**
 * Genera un precio aleatorio con 2-3 dígitos enteros y 2-4 decimales.
 *
 * @returns string con el precio generado, listo para llenar en un input
 */
export function generateRandomPrice(): string {
  // Parte entera: 10 a 999 (2-3 dígitos)
  const parteEntera = Math.floor(Math.random() * 990) + 10;

  // Cantidad de decimales: 2, 3 o 4
  const cantidadDecimales = Math.floor(Math.random() * 3) + 2;

  // Parte decimal según cantidad definida
  const maxDecimal = Math.pow(10, cantidadDecimales);
  const parteDecimal = Math.floor(Math.random() * (maxDecimal - 1)) + 1;

  return `${parteEntera}.${parteDecimal.toString().padStart(cantidadDecimales, '0')}`;
}
