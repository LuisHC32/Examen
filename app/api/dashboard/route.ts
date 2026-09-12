import { requireUser } from "@/lib/auth";
import { jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth) return auth.error;

  const [users, products, clients] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.client.count(),
  ]);

  return jsonOk({ users, products, clients });
}
