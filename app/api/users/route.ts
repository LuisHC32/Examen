import { requireUser } from "@/lib/auth";
import {
  jsonCreated,
  jsonOk,
  jsonValidation,
  prismaConflict,
  zodDetails,
} from "@/lib/http";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { publicUser } from "@/lib/public-user";
import { userCreateSchema } from "@/lib/validators/user";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth) return auth.error;

  const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
  return jsonOk(users.map(publicUser));
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

  const parsed = userCreateSchema.safeParse(body);
  if (!parsed.success) return jsonValidation(zodDetails(parsed.error));

  const { password, ...data } = parsed.data;
  try {
    const user = await prisma.user.create({
      data: { ...data, passwordHash: await hashPassword(password) },
    });
    return jsonCreated(publicUser(user));
  } catch (error) {
    const conflict = prismaConflict(error);
    if (conflict) return conflict;
    throw error;
  }
}
