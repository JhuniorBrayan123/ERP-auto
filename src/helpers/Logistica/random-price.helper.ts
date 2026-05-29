export function generateRandomPrice(): string {
  
  const parteEntera = Math.floor(Math.random() * 990) + 10;

  const cantidadDecimales = Math.floor(Math.random() * 3) + 2;

  const maxDecimal = Math.pow(10, cantidadDecimales);
  const parteDecimal = Math.floor(Math.random() * (maxDecimal - 1)) + 1;

  return `${parteEntera}.${parteDecimal.toString().padStart(cantidadDecimales, '0')}`;
}
