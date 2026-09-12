import { requireUser } from "@/lib/auth";
import {
  jsonError,
  jsonNoContent,
  jsonOk,
  jsonValidation,
  prismaConflict,
  zodDetails,
} from "@/lib/http";
import { parseId } from "@/lib/ids";
import { prisma } from "@/lib/prisma";
import { clientWriteSchema } from "@/lib/validators/client";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireUser(request);
  if ("error" in auth) return auth.error;

  const id = parseId((await context.params).id);
  if (!id) return jsonError("No encontrado", 404);

  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) return jsonError("No encontrado", 404);
  return jsonOk(client);
}

export async function PUT(request: Request, context: RouteContext) {
  const auth = await requireUser(request);
  if ("error" in auth) return auth.error;

  const id = parseId((await context.params).id);
  if (!id) return jsonError("No encontrado", 404);

  const existing = await prisma.client.findUnique({ where: { id } });
  if (!existing) return jsonError("No encontrado", 404);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonValidation({ _root: "JSON inválido" });
  }

  const parsed = clientWriteSchema.safeParse(body);
  if (!parsed.success) return jsonValidation(zodDetails(parsed.error));

  try {
    const client = await prisma.client.update({
      where: { id },
      data: parsed.data,
    });
    return jsonOk(client);
  } catch (error) {
    const conflict = prismaConflict(error);
    if (conflict) return conflict;
    throw error;
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireUser(request);
  if ("error" in auth) return auth.error;

  const id = parseId((await context.params).id);
  if (!id) return jsonError("No encontrado", 404);

  try {
    await prisma.client.delete({ where: { id } });
  } catch {
    return jsonError("No encontrado", 404);
  }
  return jsonNoContent();
}
