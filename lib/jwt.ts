import { SignJWT, jwtVerify } from "jose";

export const TOKEN_COOKIE = "ventasfix_token";
export const TOKEN_MAX_AGE = 8 * 60 * 60;

export type AuthPayload = {
  userId: number;
  email: string;
};

function secretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET debe tener al menos 32 caracteres");
  }
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: AuthPayload): Promise<string> {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(payload.userId))
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secretKey());
}

export async function verifyToken(token: string): Promise<AuthPayload> {
  const { payload } = await jwtVerify(token, secretKey());
  const userId = Number(payload.sub);
  const email = typeof payload.email === "string" ? payload.email : "";
  if (!Number.isInteger(userId) || userId < 1 || !email) {
    throw new Error("Token inválido");
  }
  return { userId, email };
}

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
    secure: process.env.COOKIE_SECURE === "true",
  };
}
