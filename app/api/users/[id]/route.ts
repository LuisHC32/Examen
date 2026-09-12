import { requireUser } from "@/lib/auth";
import { jsonError, jsonNoContent, jsonOk, jsonValidation, prismaConflict, zodDetails } from "@/lib/http";
import { parseId } from "@/lib/ids";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { publicUser } from "@/lib/public-user";
import { userUpdateSchema } from "@/lib/validators/user";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireUser(request);
  if ("error" in auth) return auth.error;

  const id = parseId((await context.params).id);
  if (!id) return jsonError("No encontrado", 404);

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return jsonError("No encontrado", 404);
  return jsonOk(publicUser(user));
}

export async function PUT(request: Request, context: RouteContext) {
  const auth = await requireUser(request);
  if ("error" in auth) return auth.error;

  const id = parseId((await context.params).id);
  if (!id) return jsonError("No encontrado", 404);

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return jsonError("No encontrado", 404);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonValidation({ _root: "JSON inválido" });
  }

  const parsed = userUpdateSchema.safeParse(body);
  if (!parsed.success) return jsonValidation(zodDetails(parsed.error));

  const { password, ...data } = parsed.data;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        ...(password ? { passwordHash: await hashPassword(password) } : {}),
      },
    });
    return jsonOk(publicUser(user));
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
    await prisma.user.delete({ where: { id } });
  } catch {
    return jsonError("No encontrado", 404);
  }
  return jsonNoContent();
}
