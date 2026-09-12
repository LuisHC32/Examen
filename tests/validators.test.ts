import { describe, expect, it } from "vitest";
import { clientCreateSchema } from "@/lib/validators/client";
import { loginSchema } from "@/lib/validators/login";
import { productWriteSchema } from "@/lib/validators/product";
import { userCreateSchema, userUpdateSchema } from "@/lib/validators/user";

describe("userCreateSchema", () => {
  const valid = {
    rut: "12.345.678-5",
    nombre: "Ana",
    apellido: "Soto",
    email: "ana.soto@ventasfix.cl",
    password: "Clave123!",
  };

  it("acepta usuario VentasFix con RUT válido y normaliza", () => {
    const parsed = userCreateSchema.parse(valid);
    expect(parsed.rut).toBe("12345678-5");
    expect(parsed.email).toBe("ana.soto@ventasfix.cl");
  });

  it("rechaza email que no es @ventasfix.cl", () => {
    const result = userCreateSchema.safeParse({
      ...valid,
      email: "ana@gmail.com",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza RUT con DV incorrecto", () => {
    const result = userCreateSchema.safeParse({ ...valid, rut: "12345678-9" });
    expect(result.success).toBe(false);
  });

  it("rechaza campos vacíos", () => {
    const result = userCreateSchema.safeParse({
      ...valid,
      nombre: "  ",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("userUpdateSchema", () => {
  it("permite omitir password", () => {
    const parsed = userUpdateSchema.parse({
      rut: "12345678-5",
      nombre: "Ana",
      apellido: "Soto",
      email: "ana.soto@ventasfix.cl",
    });
    expect(parsed.password).toBeUndefined();
  });

  it("trata password vacía como ausente", () => {
    const parsed = userUpdateSchema.parse({
      rut: "12345678-5",
      nombre: "Ana",
      apellido: "Soto",
      email: "ana.soto@ventasfix.cl",
      password: "   ",
    });
    expect(parsed.password).toBeUndefined();
  });
});

describe("productWriteSchema", () => {
  const valid = {
    sku: "SKU-001",
    nombre: "Notebook",
    descripcionCorta: "Portátil 14",
    descripcionLarga: "Equipo para oficina",
    precioNeto: 100000,
    stockActual: 10,
    stockMinimo: 2,
    stockBajo: 5,
    stockAlto: 50,
  };

  it("acepta producto con precioNeto >= 1 y stocks >= 0", () => {
    const parsed = productWriteSchema.parse(valid);
    expect(parsed.precioNeto).toBe(100000);
  });

  it("rechaza precioNeto menor a 1", () => {
    expect(productWriteSchema.safeParse({ ...valid, precioNeto: 0 }).success).toBe(
      false,
    );
  });

  it("rechaza stocks negativos", () => {
    expect(
      productWriteSchema.safeParse({ ...valid, stockActual: -1 }).success,
    ).toBe(false);
  });

  it("coacciona strings de formulario a enteros", () => {
    const parsed = productWriteSchema.parse({
      ...valid,
      precioNeto: "1999",
      stockActual: "0",
    });
    expect(parsed.precioNeto).toBe(1999);
    expect(parsed.stockActual).toBe(0);
  });
});

describe("clientCreateSchema", () => {
  const valid = {
    rutEmpresa: "1.000.005-K",
    rubro: "Tecnología",
    razonSocial: "Cliente SpA",
    telefono: "+56 9 1234 5678",
    direccion: "Av. Providencia 100",
    nombreContacto: "Luis Pérez",
    emailContacto: "compras@cliente.cl",
  };

  it("acepta email de contacto fuera de ventasfix.cl", () => {
    const parsed = clientCreateSchema.parse(valid);
    expect(parsed.emailContacto).toBe("compras@cliente.cl");
    expect(parsed.rutEmpresa).toBe("1000005-K");
  });

  it("rechaza email de contacto inválido", () => {
    expect(
      clientCreateSchema.safeParse({ ...valid, emailContacto: "no-es-email" })
        .success,
    ).toBe(false);
  });
});

describe("loginSchema", () => {
  it("exige email y password no vacíos", () => {
    expect(loginSchema.safeParse({ email: "", password: "x" }).success).toBe(
      false,
    );
    expect(
      loginSchema.parse({ email: "admin@ventasfix.cl", password: "Admin123!" }),
    ).toEqual({
      email: "admin@ventasfix.cl",
      password: "Admin123!",
    });
  });
});
