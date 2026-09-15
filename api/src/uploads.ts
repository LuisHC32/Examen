import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export function uploadsDir(): string {
  return process.env.UPLOADS_DIR ?? path.join(process.cwd(), "uploads");
}

export function isImageMime(mime: string): boolean {
  return Object.hasOwn(MIME_EXT, mime);
}

function safeSku(sku: string): string {
  return sku.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || "producto";
}

export async function saveProductImage(
  buffer: Buffer,
  mime: string,
  sku: string,
): Promise<string> {
  const ext = MIME_EXT[mime];
  if (!ext) {
    throw new Error("Tipo de imagen no permitido");
  }
  const dir = uploadsDir();
  await mkdir(dir, { recursive: true });
  const name = `${safeSku(sku)}-${Date.now()}${ext}`;
  await writeFile(path.join(dir, name), buffer);
  return `/uploads/${name}`;
}

export async function deleteProductImage(publicPath: string | null | undefined) {
  if (!publicPath || !publicPath.startsWith("/uploads/")) return;
  const relative = publicPath.replace(/^\/uploads\//, "");
  if (
    !relative ||
    relative.includes("..") ||
    relative.includes("/") ||
    relative.includes("\\")
  ) {
    return;
  }
  try {
    await unlink(path.join(uploadsDir(), relative));
  } catch {
    // el archivo puede no existir
  }
}
