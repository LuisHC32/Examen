import { jsonOk } from "@/lib/http";
import { cookieOptions, TOKEN_COOKIE } from "@/lib/jwt";

export const runtime = "nodejs";

export async function POST() {
  const response = jsonOk({ ok: true });
  response.cookies.set(TOKEN_COOKIE, "", cookieOptions(0));
  return response;
}
