import { z } from "zod";
import { requiredText } from "@/lib/validators/common";

export const loginSchema = z.object({
  email: requiredText
    .email("Email inválido")
    .transform((value) => value.toLowerCase()),
  password: requiredText,
});
