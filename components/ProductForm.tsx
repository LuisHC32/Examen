"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { apiFetch, errorToastMessage } from "@/lib/api-client";
import { calcularPrecioVenta } from "@/lib/precio";
import { clp } from "@/lib/format";

export type ProductRecord = {
  id: number;
  sku: string;
  nombre: string;
  descripcionCorta: string;
  descripcionLarga: string;
  imagen: string;
  precioNeto: number;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
  stockBajo: number;
  stockAlto: number;
};

export function ProductForm({ initial }: { initial?: ProductRecord }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [neto, setNeto] = useState(initial?.precioNeto ?? 0);
  const editing = Boolean(initial);
  const venta = useMemo(() => (neto >= 1 ? calcularPrecioVenta(neto) : 0), [neto]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    try {
      if (editing && initial) {
        await apiFetch(`/api/products/${initial.id}`, {
          method: "PUT",
          body: data,
        });
        toast.success("Producto actualizado");
      } else {
        await apiFetch("/api/products", { method: "POST", body: data });
        toast.success("Producto creado");
      }
      router.push("/productos");
      router.refresh();
    } catch (error) {
      toast.error(errorToastMessage(error));
    } finally {
      setPending(false);
    }
  }

  const fieldClass =
    "w-full rounded-lg border border-[var(--vf-line)] bg-white px-3 py-2.5 outline-none ring-[var(--vf-gold)] focus:ring-2";

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">SKU</span>
          <input name="sku" required defaultValue={initial?.sku} className={fieldClass} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Nombre</span>
          <input name="nombre" required defaultValue={initial?.nombre} className={fieldClass} />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Descripción corta</span>
        <input
          name="descripcionCorta"
          required
          defaultValue={initial?.descripcionCorta}
          className={fieldClass}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Descripción larga</span>
        <textarea
          name="descripcionLarga"
          required
          rows={4}
          defaultValue={initial?.descripcionLarga}
          className={fieldClass}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Precio neto (CLP)</span>
          <input
            name="precioNeto"
            type="number"
            min={1}
            step={1}
            required
            defaultValue={initial?.precioNeto}
            onChange={(event) => setNeto(Number(event.target.value))}
            className={fieldClass}
          />
        </label>
        <div>
          <span className="mb-1.5 block text-sm font-medium">Precio de venta</span>
          <p className="rounded-lg border border-dashed border-[var(--vf-line)] bg-white/60 px-3 py-2.5">
            {neto >= 1 ? clp(venta) : "—"}
            <span className="ml-2 text-sm text-[var(--vf-muted)]">IVA 19%</span>
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        {(
          [
            ["stockActual", "Stock actual", initial?.stockActual],
            ["stockMinimo", "Stock mínimo", initial?.stockMinimo],
            ["stockBajo", "Stock bajo", initial?.stockBajo],
            ["stockAlto", "Stock alto", initial?.stockAlto],
          ] as const
        ).map(([name, label, value]) => (
          <label key={name} className="block">
            <span className="mb-1.5 block text-sm font-medium">{label}</span>
            <input
              name={name}
              type="number"
              min={0}
              step={1}
              required
              defaultValue={value}
              className={fieldClass}
            />
          </label>
        ))}
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">
          Imagen {editing ? "(opcional)" : ""}
        </span>
        <input
          name="imagen"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required={!editing}
          className="w-full text-sm"
        />
        {initial?.imagen ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={initial.imagen}
            alt={initial.nombre}
            className="mt-3 h-24 w-24 rounded-lg object-cover"
          />
        ) : null}
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--vf-pine)] px-4 py-2.5 font-medium text-white hover:bg-[var(--vf-pine-2)] disabled:opacity-60"
      >
        {pending ? "Guardando…" : editing ? "Guardar cambios" : "Crear producto"}
      </button>
    </form>
  );
}
