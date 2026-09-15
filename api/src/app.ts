import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { jsonError, jsonValidation } from "./http";
import { requireAuth } from "./middleware/auth";
import { authRouter } from "./routes/auth";
import { clientsRouter } from "./routes/clients";
import { dashboardRouter } from "./routes/dashboard";
import { productsRouter } from "./routes/products";
import { usersRouter } from "./routes/users";
import { uploadsDir } from "./uploads";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));
  app.use("/uploads", express.static(uploadsDir()));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/users", requireAuth, usersRouter);
  app.use("/api/products", requireAuth, productsRouter);
  app.use("/api/clients", requireAuth, clientsRouter);
  app.use("/api/dashboard", requireAuth, dashboardRouter);

  app.use((_req, res) => {
    jsonError(res, "No encontrado", 404);
  });

  app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) {
      next(err);
      return;
    }
    if (err instanceof SyntaxError) {
      jsonValidation(res, { _root: "JSON inválido" });
      return;
    }
    console.error(err);
    jsonError(res, "Error interno", 500);
  });

  return app;
}
