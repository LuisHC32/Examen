import { z } from "zod";
import { contactEmail, requiredText, rutField } from "@/lib/validators/common";

export const clientWriteSchema = z.object({
  rutEmpresa: rutField,
  rubro: requiredText,
  razonSocial: requiredText,
  telefono: requiredText,
  direccion: requiredText,
  nombreContacto: requiredText,
  emailContacto: contactEmail,
});

export const clientCreateSchema = clientWriteSchema;

export type ClientWriteInput = z.infer<typeof clientWriteSchema>;
