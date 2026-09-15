import type { NextFunction, Request, Response } from "express";
import { jsonError } from "../http";
import { TOKEN_COOKIE, verifyToken, type AuthPayload } from "../jwt";

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

function bearerToken(header: string | undefined): string | null {
  if (!header || !/^Bearer\s+/i.test(header)) return null;
  const token = header.replace(/^Bearer\s+/i, "").trim();
  return token || null;
}

export function extractToken(req: Request): string | null {
  return bearerToken(req.headers.authorization) ?? req.cookies?.[TOKEN_COOKIE] ?? null;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    jsonError(res, "No autenticado", 401);
    return;
  }
  try {
    req.user = await verifyToken(token);
    next();
  } catch {
    jsonError(res, "Token inválido o expirado", 401);
  }
}
