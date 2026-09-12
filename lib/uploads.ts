import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export function isImageFile(file: File): boolean {
  return Object.hasOwn(MIME_EXT, file.type);
}

function safeSku(sku: string): string {
  return sku.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || "producto";
}

export async function saveProductImage(file: File, sku: string): Promise<string> {
  const ext = MIME_EXT[file.type];
  if (!ext) {
    throw new Error("Tipo de imagen no permitido");
  }
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const name = `${safeSku(sku)}-${Date.now()}${ext}`;
  const full = path.join(dir, name);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(full, buffer);
  return `/uploads/${name}`;
}

export async function deleteProductImage(publicPath: string | null | undefined) {
  if (!publicPath || !publicPath.startsWith("/uploads/")) return;
  const relative = publicPath.replace(/^\/uploads\//, "");
  if (!relative || relative.includes("..") || relative.includes("/") || relative.includes("\\")) {
    return;
  }
  const full = path.join(process.cwd(), "public", "uploads", relative);
  try {
    await unlink(full);
  } catch {
    // el archivo puede no existir
  }
}
