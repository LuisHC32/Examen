import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import multer from "multer";
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
import { calcularPrecioVenta } from "../precio";
import { prisma } from "../prisma";
import { deleteProductImage, isImageMime, saveProductImage } from "../uploads";
import { productWriteSchema } from "../validators/product";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

function optionalImage(req: Request, res: Response, next: NextFunction) {
  const contentType = req.headers["content-type"] ?? "";
  if (contentType.includes("multipart/form-data")) {
    upload.single("imagen")(req, res, next);
    return;
  }
  next();
}

export const productsRouter = Router();

productsRouter.get("/", async (_req, res) => {
  const products = await prisma.product.findMany({ orderBy: { id: "asc" } });
  jsonOk(res, products);
});

productsRouter.post("/", upload.single("imagen"), async (req, res) => {
  const contentType = req.headers["content-type"] ?? "";
  if (!contentType.includes("multipart/form-data")) {
    jsonValidation(res, {
      imagen: "El alta requiere un archivo de imagen (jpeg, png o webp)",
    });
    return;
  }

  const parsed = productWriteSchema.safeParse(req.body);
  if (!parsed.success) {
    jsonValidation(res, zodDetails(parsed.error));
    return;
  }

  const file = req.file;
  if (!file || file.size === 0) {
    jsonValidation(res, {
      imagen: "El alta requiere un archivo de imagen (jpeg, png o webp)",
    });
    return;
  }
  if (!isImageMime(file.mimetype)) {
    jsonValidation(res, { imagen: "La imagen debe ser jpeg, png o webp" });
    return;
  }

  const imagen = await saveProductImage(file.buffer, file.mimetype, parsed.data.sku);
  try {
    const product = await prisma.product.create({
      data: {
        ...parsed.data,
        imagen,
        precioVenta: calcularPrecioVenta(parsed.data.precioNeto),
      },
    });
    jsonCreated(res, product);
  } catch (error) {
    if (sendPrismaConflict(res, error)) return;
    throw error;
  }
});

productsRouter.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    jsonError(res, "No encontrado", 404);
    return;
  }
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    jsonError(res, "No encontrado", 404);
    return;
  }
  jsonOk(res, product);
});

productsRouter.put("/:id", optionalImage, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    jsonError(res, "No encontrado", 404);
    return;
  }
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    jsonError(res, "No encontrado", 404);
    return;
  }

  const parsed = productWriteSchema.safeParse(req.body);
  if (!parsed.success) {
    jsonValidation(res, zodDetails(parsed.error));
    return;
  }

  let imagen = existing.imagen;
  const file = req.file;
  if (file && file.size > 0) {
    if (!isImageMime(file.mimetype)) {
      jsonValidation(res, { imagen: "La imagen debe ser jpeg, png o webp" });
      return;
    }
    imagen = await saveProductImage(file.buffer, file.mimetype, parsed.data.sku);
    if (imagen !== existing.imagen) {
      await deleteProductImage(existing.imagen);
    }
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...parsed.data,
        imagen,
        precioVenta: calcularPrecioVenta(parsed.data.precioNeto),
      },
    });
    jsonOk(res, product);
  } catch (error) {
    if (sendPrismaConflict(res, error)) return;
    throw error;
  }
});

productsRouter.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    jsonError(res, "No encontrado", 404);
    return;
  }
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    jsonError(res, "No encontrado", 404);
    return;
  }
  await prisma.product.delete({ where: { id } });
  await deleteProductImage(existing.imagen);
  jsonNoContent(res);
});
