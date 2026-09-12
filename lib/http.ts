import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export function jsonValidation(details: Record<string, string>) {
  return NextResponse.json({ error: "Validación", details }, { status: 400 });
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonCreated<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function jsonNoContent() {
  return new NextResponse(null, { status: 204 });
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

export function prismaConflict(error: unknown): NextResponse | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  ) {
    const target =
      (error as { meta?: { target?: string[] } }).meta?.target ?? [];
    return jsonError(uniqueConflictMessage(target), 409);
  }
  return null;
}
