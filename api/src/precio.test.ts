import { describe, expect, it } from "vitest";
import { calcularPrecioVenta } from "./precio";

describe("calcularPrecioVenta", () => {
  it("aplica IVA 19% y redondea al peso entero", () => {
    expect(calcularPrecioVenta(1000)).toBe(1190);
    expect(calcularPrecioVenta(1999)).toBe(2379);
    expect(calcularPrecioVenta(1)).toBe(1);
    expect(calcularPrecioVenta(3)).toBe(4);
  });
});
