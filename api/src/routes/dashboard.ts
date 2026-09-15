import { Router } from "express";
import { jsonOk } from "../http";
import { prisma } from "../prisma";

export const dashboardRouter = Router();

dashboardRouter.get("/", async (_req, res) => {
  const [users, products, clients] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.client.count(),
  ]);
  jsonOk(res, { users, products, clients });
});
