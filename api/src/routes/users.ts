import { Router } from "express";
import {
  jsonCreated,
  jsonError,
  jsonNoContent,
  jsonOk,
  jsonValidation,
  sendPrismaConflict,
  zodDetails,
} from "../http";
import { parseId } from "../ids";
import { hashPassword } from "../password";
import { prisma } from "../prisma";
import { publicUser } from "../public-user";
import { userCreateSchema, userUpdateSchema } from "../validators/user";

export const usersRouter = Router();

usersRouter.get("/", async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
  jsonOk(res, users.map(publicUser));
});

usersRouter.post("/", async (req, res) => {
  const parsed = userCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    jsonValidation(res, zodDetails(parsed.error));
    return;
  }

  const { password, ...data } = parsed.data;
  try {
    const user = await prisma.user.create({
      data: { ...data, passwordHash: await hashPassword(password) },
    });
    jsonCreated(res, publicUser(user));
  } catch (error) {
    if (sendPrismaConflict(res, error)) return;
    throw error;
  }
});

usersRouter.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    jsonError(res, "No encontrado", 404);
    return;
  }
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    jsonError(res, "No encontrado", 404);
    return;
  }
  jsonOk(res, publicUser(user));
});

usersRouter.put("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    jsonError(res, "No encontrado", 404);
    return;
  }
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    jsonError(res, "No encontrado", 404);
    return;
  }

  const parsed = userUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    jsonValidation(res, zodDetails(parsed.error));
    return;
  }

  const { password, ...data } = parsed.data;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        ...(password ? { passwordHash: await hashPassword(password) } : {}),
      },
    });
    jsonOk(res, publicUser(user));
  } catch (error) {
    if (sendPrismaConflict(res, error)) return;
    throw error;
  }
});

usersRouter.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    jsonError(res, "No encontrado", 404);
    return;
  }
  try {
    await prisma.user.delete({ where: { id } });
  } catch {
    jsonError(res, "No encontrado", 404);
    return;
  }
  jsonNoContent(res);
});
