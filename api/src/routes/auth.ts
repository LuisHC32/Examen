import { Router } from "express";
import { jsonError, jsonOk, jsonValidation, zodDetails } from "../http";
import { cookieOptions, signToken, TOKEN_COOKIE, TOKEN_MAX_AGE } from "../jwt";
import { requireAuth } from "../middleware/auth";
import { verifyPassword } from "../password";
import { prisma } from "../prisma";
import { loginSchema } from "../validators/login";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    jsonValidation(res, zodDetails(parsed.error));
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user || !(await verifyPassword(user.passwordHash, parsed.data.password))) {
    jsonError(res, "Credenciales incorrectas", 401);
    return;
  }

  const token = await signToken({ userId: user.id, email: user.email });
  res.cookie(TOKEN_COOKIE, token, cookieOptions(TOKEN_MAX_AGE));
  jsonOk(res, { token });
});

authRouter.post("/logout", (_req, res) => {
  res.cookie(TOKEN_COOKIE, "", cookieOptions(0));
  jsonOk(res, { ok: true });
});

authRouter.get("/me", requireAuth, (req, res) => {
  jsonOk(res, { userId: req.user!.userId, email: req.user!.email });
});
