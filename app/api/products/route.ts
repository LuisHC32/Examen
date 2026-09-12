import { requireUser } from "@/lib/auth";
import {
  jsonCreated,
  jsonOk,
  jsonValidation,
  prismaConflict,
  zodDetails,
} from "@/lib/http";
import { calcularPrecioVenta } from "@/lib/precio";
import { prisma } from "@/lib/prisma";
import { isImageFile, saveProductImage } from "@/lib/uploads";
import { productWriteSchema } from "@/lib/validators/product";

export const runtime = "nodejs";

function fieldsFromForm(form: FormData): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (key === "imagen") continue;
    if (typeof value === "string") fields[key] = value;
  }
  return fields;
}

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth) return auth.error;
  const products = await prisma.product.findMany({ orderBy: { id: "asc" } });
  return jsonOk(products);
}

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth) return auth.error;

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return jsonValidation({
      imagen: "El alta requiere un archivo de imagen (jpeg, png o webp)",
    });
  }

  const form = await request.formData();
  const parsed = productWriteSchema.safeParse(fieldsFromForm(form));
  if (!parsed.success) return jsonValidation(zodDetails(parsed.error));

  const file = form.get("imagen");
  if (!(file instanceof File) || file.size === 0) {
    return jsonValidation({
      imagen: "El alta requiere un archivo de imagen (jpeg, png o webp)",
    });
  }
  if (!isImageFile(file)) {
    return jsonValidation({ imagen: "La imagen debe ser jpeg, png o webp" });
  }

  const imagen = await saveProductImage(file, parsed.data.sku);
  try {
    const product = await prisma.product.create({
      data: {
        ...parsed.data,
        imagen,
        precioVenta: calcularPrecioVenta(parsed.data.precioNeto),
      },
    });
    return jsonCreated(product);
  } catch (error) {
    const conflict = prismaConflict(error);
    if (conflict) return conflict;
    throw error;
  }
}
