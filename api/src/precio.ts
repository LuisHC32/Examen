const IVA = 1.19;

export function calcularPrecioVenta(precioNeto: number): number {
  return Math.round(precioNeto * IVA);
}
