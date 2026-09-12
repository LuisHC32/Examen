import { z } from "zod";
import { requiredText, rutField, userEmail } from "@/lib/validators/common";

const passwordCreate = requiredText;

const passwordUpdate = z
  .string()
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  });

export const userCreateSchema = z.object({
  rut: rutField,
  nombre: requiredText,
  apellido: requiredText,
  email: userEmail,
  password: passwordCreate,
});

export const userUpdateSchema = z.object({
  rut: rutField,
  nombre: requiredText,
  apellido: requiredText,
  email: userEmail,
  password: passwordUpdate,
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
