import { jsonError, jsonOk, jsonValidation, zodDetails } from "@/lib/http";
import { cookieOptions, signToken, TOKEN_COOKIE, TOKEN_MAX_AGE } from "@/lib/jwt";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators/login";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonValidation({ _root: "JSON inválido" });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return jsonValidation(zodDetails(parsed.error));

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user || !(await verifyPassword(user.passwordHash, parsed.data.password))) {
    return jsonError("Credenciales incorrectas", 401);
  }

  const token = await signToken({ userId: user.id, email: user.email });
  const response = jsonOk({ token });
  response.cookies.set(TOKEN_COOKIE, token, cookieOptions(TOKEN_MAX_AGE));
  return response;
}
