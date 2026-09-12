"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { BackLink } from "@/components/BackLink";
import { UserForm, type UserRecord } from "@/components/UserForm";
import { apiFetch, errorToastMessage } from "@/lib/api-client";

export default function EditarUsuarioPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<UserRecord | null>(null);

  useEffect(() => {
    apiFetch<UserRecord>(`/api/users/${params.id}`)
      .then(setUser)
      .catch((error) => toast.error(errorToastMessage(error)));
  }, [params.id]);

  if (!user) {
    return (
      <div>
        <BackLink href="/usuarios" label="Volver a usuarios" />
        <p className="text-[var(--vf-muted)]">Cargando…</p>
      </div>
    );
  }

  return (
    <div>
      <BackLink href="/usuarios" label="Volver a usuarios" />
      <h1 className="text-3xl font-semibold tracking-tight">Editar usuario</h1>
      <p className="mt-1 mb-6 text-[var(--vf-muted)]">
        Deja la contraseña vacía si no quieres cambiarla.
      </p>
      <UserForm initial={user} />
    </div>
  );
}
