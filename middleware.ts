import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TOKEN_COOKIE } from "@/lib/jwt";

function unauthorizedApi(message: string) {
  return NextResponse.json({ error: message }, { status: 401 });
}

function redirectLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname === "/login" ||
    pathname === "/api/auth/login" ||
    pathname === "/api/auth/logout"
  ) {
    return NextResponse.next();
  }

  const bearer = request.headers.get("authorization");
  const headerToken =
    bearer && /^Bearer\s+/i.test(bearer)
      ? bearer.replace(/^Bearer\s+/i, "").trim()
      : "";
  const token = headerToken || request.cookies.get(TOKEN_COOKIE)?.value;

  if (!token) {
    return pathname.startsWith("/api")
      ? unauthorizedApi("No autenticado")
      : redirectLogin(request);
  }

  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    return pathname.startsWith("/api")
      ? unauthorizedApi("Token inválido o expirado")
      : redirectLogin(request);
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next();
  } catch {
    return pathname.startsWith("/api")
      ? unauthorizedApi("Token inválido o expirado")
      : redirectLogin(request);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads/).*)"],
};
