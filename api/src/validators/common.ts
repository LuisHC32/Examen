import { z } from "zod";
import { normalizeRut } from "../rut";

export const rutField = z
  .string({ required_error: "Obligatorio" })
  .trim()
  .min(1, "Obligatorio")
  .transform((value, ctx) => {
    const normalized = normalizeRut(value);
    if (!normalized) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "RUT inválido (dígito verificador)",
      });
      return z.NEVER;
    }
    return normalized;
  });

export const requiredText = z
  .string({ required_error: "Obligatorio" })
  .trim()
  .min(1, "Obligatorio");

export const userEmail = requiredText
  .email("Email inválido")
  .transform((value) => value.toLowerCase())
  .refine((value) => value.endsWith("@ventasfix.cl"), {
    message: "Debe terminar en @ventasfix.cl",
  });

export const contactEmail = requiredText
  .email("Email inválido")
  .transform((value) => value.toLowerCase());
