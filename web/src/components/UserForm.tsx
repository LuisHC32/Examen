import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { apiFetch, errorToastMessage } from "@/lib/api-client";

export type UserRecord = {
  id: number;
  rut: string;
  nombre: string;
  apellido: string;
  email: string;
};

export function UserForm({ initial }: { initial?: UserRecord }) {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const editing = Boolean(initial);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      rut: String(form.get("rut") ?? ""),
      nombre: String(form.get("nombre") ?? ""),
      apellido: String(form.get("apellido") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    };
    setPending(true);
    try {
      if (editing && initial) {
        await apiFetch(`/api/users/${initial.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Usuario actualizado");
      } else {
        await apiFetch("/api/users", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Usuario creado");
      }
      navigate("/usuarios");
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
        <span className="mb-1.5 block text-sm font-medium">RUT</span>
        <input name="rut" required defaultValue={initial?.rut} className={fieldClass} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Nombre</span>
          <input name="nombre" required defaultValue={initial?.nombre} className={fieldClass} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Apellido</span>
          <input name="apellido" required defaultValue={initial?.apellido} className={fieldClass} />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Email</span>
        <input
          name="email"
          type="email"
          required
          defaultValue={initial?.email}
          className={fieldClass}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">
          Contraseña {editing ? "(opcional)" : ""}
        </span>
        <input
          name="password"
          type="password"
          required={!editing}
          className={fieldClass}
          autoComplete={editing ? "new-password" : "password"}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--vf-pine)] px-4 py-2.5 font-medium text-white hover:bg-[var(--vf-pine-2)] disabled:opacity-60"
      >
        {pending ? "Guardando…" : editing ? "Guardar cambios" : "Crear usuario"}
      </button>
    </form>
  );
}
