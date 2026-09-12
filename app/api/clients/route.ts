import { requireUser } from "@/lib/auth";
import {
  jsonCreated,
  jsonOk,
  jsonValidation,
  prismaConflict,
  zodDetails,
} from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { clientWriteSchema } from "@/lib/validators/client";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth) return auth.error;
  const clients = await prisma.client.findMany({ orderBy: { id: "asc" } });
  return jsonOk(clients);
}

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonValidation({ _root: "JSON inválido" });
  }

  const parsed = clientWriteSchema.safeParse(body);
  if (!parsed.success) return jsonValidation(zodDetails(parsed.error));

  try {
    const client = await prisma.client.create({ data: parsed.data });
    return jsonCreated(client);
  } catch (error) {
    const conflict = prismaConflict(error);
    if (conflict) return conflict;
    throw error;
  }
}
