import type { Response } from "express";
import type { ZodError } from "zod";

export function jsonError(res: Response, error: string, status: number) {
  return res.status(status).json({ error });
}

export function jsonValidation(res: Response, details: Record<string, string>) {
  return res.status(400).json({ error: "Validación", details });
}

export function jsonOk<T>(res: Response, data: T, status = 200) {
  return res.status(status).json(data);
}

export function jsonCreated<T>(res: Response, data: T) {
  return res.status(201).json(data);
}

export function jsonNoContent(res: Response) {
  return res.status(204).end();
}

export function zodDetails(error: ZodError): Record<string, string> {
  const details: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_root";
    if (!details[key]) details[key] = issue.message;
  }
  return details;
}

export function uniqueConflictMessage(target: string[]): string {
  if (target.includes("email")) return "El email ya está en uso";
  if (target.includes("rutEmpresa")) return "El RUT de empresa ya está en uso";
  if (target.includes("sku")) return "El SKU ya está en uso";
  if (target.includes("rut")) return "El RUT ya está en uso";
  return "El registro ya existe";
}

export function prismaConflict(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  ) {
    const target =
      (error as { meta?: { target?: string[] } }).meta?.target ?? [];
    return uniqueConflictMessage(target);
  }
  return null;
}

export function sendPrismaConflict(res: Response, error: unknown): boolean {
  const message = prismaConflict(error);
  if (!message) return false;
  jsonError(res, message, 409);
  return true;
}
