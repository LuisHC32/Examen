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
import { prisma } from "../prisma";
import { clientWriteSchema } from "../validators/client";

export const clientsRouter = Router();

clientsRouter.get("/", async (_req, res) => {
  const clients = await prisma.client.findMany({ orderBy: { id: "asc" } });
  jsonOk(res, clients);
});

clientsRouter.post("/", async (req, res) => {
  const parsed = clientWriteSchema.safeParse(req.body);
  if (!parsed.success) {
    jsonValidation(res, zodDetails(parsed.error));
    return;
  }
  try {
    const client = await prisma.client.create({ data: parsed.data });
    jsonCreated(res, client);
  } catch (error) {
    if (sendPrismaConflict(res, error)) return;
    throw error;
  }
});

clientsRouter.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    jsonError(res, "No encontrado", 404);
    return;
  }
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) {
    jsonError(res, "No encontrado", 404);
    return;
  }
  jsonOk(res, client);
});

clientsRouter.put("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    jsonError(res, "No encontrado", 404);
    return;
  }
  const existing = await prisma.client.findUnique({ where: { id } });
  if (!existing) {
    jsonError(res, "No encontrado", 404);
    return;
  }

  const parsed = clientWriteSchema.safeParse(req.body);
  if (!parsed.success) {
    jsonValidation(res, zodDetails(parsed.error));
    return;
  }

  try {
    const client = await prisma.client.update({
      where: { id },
      data: parsed.data,
    });
    jsonOk(res, client);
  } catch (error) {
    if (sendPrismaConflict(res, error)) return;
    throw error;
  }
});

clientsRouter.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    jsonError(res, "No encontrado", 404);
    return;
  }
  try {
    await prisma.client.delete({ where: { id } });
  } catch {
    jsonError(res, "No encontrado", 404);
    return;
  }
  jsonNoContent(res);
});
