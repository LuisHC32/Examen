"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmButton } from "@/components/ConfirmButton";
import { PencilIcon, TrashIcon } from "@/components/icons";
import type { ProductRecord } from "@/components/ProductForm";
import { apiFetch, errorToastMessage } from "@/lib/api-client";
import { clp } from "@/lib/format";

export default function ProductosPage() {
  const [products, setProducts] = useState<ProductRecord[] | null>(null);

  async function load() {
    try {
      setProducts(await apiFetch<ProductRecord[]>("/api/products"));
    } catch (error) {
      toast.error(errorToastMessage(error));
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function remove(id: number) {
    await apiFetch(`/api/products/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Productos</h1>
          <p className="mt-1 text-[var(--vf-muted)]">
            Precio de venta = redondeo de neto × 1.19
          </p>
        </div>
        <Link
          href="/productos/nuevo"
          className="rounded-lg bg-[var(--vf-pine)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--vf-pine-2)]"
        >
          Nuevo producto
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--vf-line)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f8f5ee] text-[var(--vf-muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Imagen</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Neto</th>
              <th className="px-4 py-3 font-medium">Venta</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((product) => (
              <tr key={product.id} className="border-t border-[var(--vf-line)]">
                <td className="px-4 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imagen}
                    alt=""
                    className="h-12 w-12 rounded-md object-cover"
                  />
                </td>
                <td className="px-4 py-3 font-mono text-[13px]">{product.sku}</td>
                <td className="px-4 py-3">{product.nombre}</td>
                <td className="px-4 py-3">{clp(product.precioNeto)}</td>
                <td className="px-4 py-3">{clp(product.precioVenta)}</td>
                <td className="px-4 py-3">
                  {product.stockActual}
                  {product.stockActual <= product.stockMinimo ? (
                    <span className="ml-2 rounded-full bg-[#fde8e6] px-2 py-0.5 text-[11px] font-medium text-[var(--vf-danger)]">
                      Bajo
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-end gap-1">
                    <Link
                      href={`/productos/${product.id}`}
                      aria-label="Editar"
                      title="Editar"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--vf-pine)] transition hover:bg-[#f8f5ee]"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <ConfirmButton
                      title="Eliminar producto"
                      description={`Se eliminará “${product.nombre}”. Esta acción no se puede deshacer.`}
                      successMessage="Producto eliminado"
                      onConfirm={() => remove(product.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </ConfirmButton>
                  </span>
                </td>
              </tr>
            ))}
            {products?.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-[var(--vf-muted)]" colSpan={7}>
                  No hay productos.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
