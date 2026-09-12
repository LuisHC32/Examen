import { describe, expect, it } from "vitest";
import { normalizeRut, parseRut } from "@/lib/rut";

describe("parseRut", () => {
  it("acepta RUT con puntos y guion", () => {
    expect(parseRut("12.345.678-5")).toEqual({
      cuerpo: "12345678",
      dv: "5",
      formatted: "12345678-5",
    });
  });

  it("acepta RUT sin puntuación", () => {
    expect(parseRut("111111111")).toEqual({
      cuerpo: "11111111",
      dv: "1",
      formatted: "11111111-1",
    });
  });

  it("acepta K minúscula cuando el dígito verificador es K", () => {
    expect(parseRut("1.000.005-k")).toEqual({
      cuerpo: "1000005",
      dv: "K",
      formatted: "1000005-K",
    });
  });

  it("rechaza dígito verificador incorrecto", () => {
    expect(parseRut("12.345.678-9")).toBeNull();
  });

  it("rechaza vacío o basura", () => {
    expect(parseRut("")).toBeNull();
    expect(parseRut("   ")).toBeNull();
    expect(parseRut("abc")).toBeNull();
    expect(parseRut("12.345.678")).toBeNull();
  });
});

describe("normalizeRut", () => {
  it("devuelve cuerpo-DV en mayúscula", () => {
    expect(normalizeRut("12.345.678-5")).toBe("12345678-5");
  });

  it("devuelve null si el DV no calza", () => {
    expect(normalizeRut("12345678-0")).toBeNull();
  });
});
