import { z } from "zod";
import { requiredText } from "@/lib/validators/common";

function emptyToUndefined(value: unknown) {
  if (value === "" || value === null || value === undefined) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}

function entero(min: number, minMsg: string) {
  return z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({
        required_error: "Obligatorio",
        invalid_type_error: "Debe ser un número",
      })
      .int("Debe ser entero")
      .min(min, minMsg),
  );
}

export const productWriteSchema = z.object({
  sku: requiredText,
  nombre: requiredText,
  descripcionCorta: requiredText,
  descripcionLarga: requiredText,
  precioNeto: entero(1, "Debe ser al menos 1"),
  stockActual: entero(0, "Debe ser al menos 0"),
  stockMinimo: entero(0, "Debe ser al menos 0"),
  stockBajo: entero(0, "Debe ser al menos 0"),
  stockAlto: entero(0, "Debe ser al menos 0"),
});

export type ProductWriteInput = z.infer<typeof productWriteSchema>;
