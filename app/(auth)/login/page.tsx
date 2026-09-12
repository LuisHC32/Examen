"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { apiFetch, errorToastMessage } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: String(form.get("email") ?? ""),
          password: String(form.get("password") ?? ""),
        }),
      });
      toast.success("Bienvenido a VentasFix");
      router.replace("/");
      router.refresh();
    } catch (error) {
      toast.error(errorToastMessage(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <p className="text-sm font-medium text-[var(--vf-gold)] lg:hidden">
        VentasFix
      </p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight">Ingresar</h2>
      <p className="mt-2 text-[var(--vf-muted)]">
        Usa tu correo @ventasfix.cl para acceder al backoffice.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            placeholder="admin@ventasfix.cl"
            className="w-full rounded-lg border border-[var(--vf-line)] bg-white px-3 py-2.5 outline-none ring-[var(--vf-gold)] focus:ring-2"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Contraseña</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-[var(--vf-line)] bg-white px-3 py-2.5 outline-none ring-[var(--vf-gold)] focus:ring-2"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-[var(--vf-pine)] px-4 py-2.5 font-medium text-white hover:bg-[var(--vf-pine-2)] disabled:opacity-60"
        >
          {pending ? "Ingresando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
