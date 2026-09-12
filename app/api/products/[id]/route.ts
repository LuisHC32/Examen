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
import { calcularPrecioVenta } from "@/lib/precio";
import { prisma } from "@/lib/prisma";
import { deleteProductImage, isImageFile, saveProductImage } from "@/lib/uploads";
import { productWriteSchema } from "@/lib/validators/product";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

function fieldsFromForm(form: FormData): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (key === "imagen") continue;
    if (typeof value === "string") fields[key] = value;
  }
  return fields;
}

async function readProductFields(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("imagen");
    const image =
      file instanceof File && file.size > 0 ? file : null;
    return { fields: fieldsFromForm(form), image };
  }
  return { fields: await request.json(), image: null as File | null };
}

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireUser(request);
  if ("error" in auth) return auth.error;

  const id = parseId((await context.params).id);
  if (!id) return jsonError("No encontrado", 404);

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return jsonError("No encontrado", 404);
  return jsonOk(product);
}

export async function PUT(request: Request, context: RouteContext) {
  const auth = await requireUser(request);
  if ("error" in auth) return auth.error;

  const id = parseId((await context.params).id);
  if (!id) return jsonError("No encontrado", 404);

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return jsonError("No encontrado", 404);

  let payload: { fields: unknown; image: File | null };
  try {
    payload = await readProductFields(request);
  } catch {
    return jsonValidation({ _root: "Cuerpo inválido" });
  }

  const parsed = productWriteSchema.safeParse(payload.fields);
  if (!parsed.success) return jsonValidation(zodDetails(parsed.error));

  let imagen = existing.imagen;
  if (payload.image) {
    if (!isImageFile(payload.image)) {
      return jsonValidation({ imagen: "La imagen debe ser jpeg, png o webp" });
    }
    imagen = await saveProductImage(payload.image, parsed.data.sku);
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
    return jsonOk(product);
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

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return jsonError("No encontrado", 404);

  await prisma.product.delete({ where: { id } });
  await deleteProductImage(existing.imagen);
  return jsonNoContent();
}
