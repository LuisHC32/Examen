"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { apiFetch, errorToastMessage } from "@/lib/api-client";

export type ClientRecord = {
  id: number;
  rutEmpresa: string;
  rubro: string;
  razonSocial: string;
  telefono: string;
  direccion: string;
  nombreContacto: string;
  emailContacto: string;
};

export function ClientForm({ initial }: { initial?: ClientRecord }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const editing = Boolean(initial);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      rutEmpresa: String(form.get("rutEmpresa") ?? ""),
      rubro: String(form.get("rubro") ?? ""),
      razonSocial: String(form.get("razonSocial") ?? ""),
      telefono: String(form.get("telefono") ?? ""),
      direccion: String(form.get("direccion") ?? ""),
      nombreContacto: String(form.get("nombreContacto") ?? ""),
      emailContacto: String(form.get("emailContacto") ?? ""),
    };
    setPending(true);
    try {
      if (editing && initial) {
        await apiFetch(`/api/clients/${initial.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Cliente actualizado");
      } else {
        await apiFetch("/api/clients", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Cliente creado");
      }
      router.push("/clientes");
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
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">RUT empresa</span>
        <input
          name="rutEmpresa"
          required
          defaultValue={initial?.rutEmpresa}
          className={fieldClass}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Razón social</span>
        <input
          name="razonSocial"
          required
          defaultValue={initial?.razonSocial}
          className={fieldClass}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Rubro</span>
          <input name="rubro" required defaultValue={initial?.rubro} className={fieldClass} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Teléfono</span>
          <input
            name="telefono"
            required
            defaultValue={initial?.telefono}
            className={fieldClass}
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Dirección</span>
        <input
          name="direccion"
          required
          defaultValue={initial?.direccion}
          className={fieldClass}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Nombre contacto</span>
          <input
            name="nombreContacto"
            required
            defaultValue={initial?.nombreContacto}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Email contacto</span>
          <input
            name="emailContacto"
            type="email"
            required
            defaultValue={initial?.emailContacto}
            className={fieldClass}
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--vf-pine)] px-4 py-2.5 font-medium text-white hover:bg-[var(--vf-pine-2)] disabled:opacity-60"
      >
        {pending ? "Guardando…" : editing ? "Guardar cambios" : "Crear cliente"}
      </button>
    </form>
  );
}
