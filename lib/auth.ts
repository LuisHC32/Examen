import { jsonError } from "@/lib/http";
import { TOKEN_COOKIE, verifyToken, type AuthPayload } from "@/lib/jwt";
import type { NextResponse } from "next/server";

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  const parts = header.split(";");
  for (const part of parts) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

export function extractToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (header && /^Bearer\s+/i.test(header)) {
    const token = header.replace(/^Bearer\s+/i, "").trim();
    if (token) return token;
  }
  return readCookie(request.headers.get("cookie"), TOKEN_COOKIE);
}

export async function requireUser(
  request: Request,
): Promise<{ user: AuthPayload } | { error: NextResponse }> {
  const token = extractToken(request);
  if (!token) return { error: jsonError("No autenticado", 401) };
  try {
    const user = await verifyToken(token);
    return { user };
  } catch {
    return { error: jsonError("Token inválido o expirado", 401) };
  }
}
