import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { BackLink } from "@/components/BackLink";
import { ProductForm, type ProductRecord } from "@/components/ProductForm";
import { apiFetch, errorToastMessage } from "@/lib/api-client";

export function EditarProductoPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductRecord | null>(null);

  useEffect(() => {
    if (!id) return;
    apiFetch<ProductRecord>(`/api/products/${id}`)
      .then(setProduct)
      .catch((error) => toast.error(errorToastMessage(error)));
  }, [id]);

  if (!product) {
    return (
      <div>
        <BackLink href="/productos" label="Volver a productos" />
        <p className="text-[var(--vf-muted)]">Cargando…</p>
      </div>
    );
  }

  return (
    <div>
      <BackLink href="/productos" label="Volver a productos" />
      <h1 className="text-3xl font-semibold tracking-tight">Editar producto</h1>
      <p className="mt-1 mb-6 text-[var(--vf-muted)]">
        Si no adjuntas una imagen nueva, se mantiene la actual.
      </p>
      <ProductForm initial={product} />
    </div>
  );
}
