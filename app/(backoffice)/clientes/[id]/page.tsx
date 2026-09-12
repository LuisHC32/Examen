"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { BackLink } from "@/components/BackLink";
import { ClientForm, type ClientRecord } from "@/components/ClientForm";
import { apiFetch, errorToastMessage } from "@/lib/api-client";

export default function EditarClientePage() {
  const params = useParams<{ id: string }>();
  const [client, setClient] = useState<ClientRecord | null>(null);

  useEffect(() => {
    apiFetch<ClientRecord>(`/api/clients/${params.id}`)
      .then(setClient)
      .catch((error) => toast.error(errorToastMessage(error)));
  }, [params.id]);

  if (!client) {
    return (
      <div>
        <BackLink href="/clientes" label="Volver a clientes" />
        <p className="text-[var(--vf-muted)]">Cargando…</p>
      </div>
    );
  }

  return (
    <div>
      <BackLink href="/clientes" label="Volver a clientes" />
      <h1 className="text-3xl font-semibold tracking-tight">Editar cliente</h1>
      <p className="mt-1 mb-6 text-[var(--vf-muted)]">PUT de recurso completo.</p>
      <ClientForm initial={client} />
    </div>
  );
}
