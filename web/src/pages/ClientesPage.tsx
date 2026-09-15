import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ConfirmButton } from "@/components/ConfirmButton";
import { PencilIcon, TrashIcon } from "@/components/icons";
import type { ClientRecord } from "@/components/ClientForm";
import { apiFetch, errorToastMessage } from "@/lib/api-client";
import { formatRut } from "@/lib/format";

export function ClientesPage() {
  const [clients, setClients] = useState<ClientRecord[] | null>(null);

  async function load() {
    try {
      setClients(await apiFetch<ClientRecord[]>("/api/clients"));
    } catch (error) {
      toast.error(errorToastMessage(error));
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function remove(id: number) {
    await apiFetch(`/api/clients/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Clientes</h1>
          <p className="mt-1 text-[var(--vf-muted)]">Empresas con RUT válido</p>
        </div>
        <Link
          to="/clientes/nuevo"
          className="rounded-lg bg-[var(--vf-pine)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--vf-pine-2)]"
        >
          Nuevo cliente
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--vf-line)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f8f5ee] text-[var(--vf-muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">RUT</th>
              <th className="px-4 py-3 font-medium">Razón social</th>
              <th className="px-4 py-3 font-medium">Rubro</th>
              <th className="px-4 py-3 font-medium">Contacto</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients?.map((client) => (
              <tr key={client.id} className="border-t border-[var(--vf-line)]">
                <td className="px-4 py-3 font-mono text-[13px]">
                  {formatRut(client.rutEmpresa)}
                </td>
                <td className="px-4 py-3">{client.razonSocial}</td>
                <td className="px-4 py-3">{client.rubro}</td>
                <td className="px-4 py-3">
                  <div>{client.nombreContacto}</div>
                  <div className="text-[var(--vf-muted)]">{client.emailContacto}</div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-end gap-1">
                    <Link
                      to={`/clientes/${client.id}`}
                      aria-label="Editar"
                      title="Editar"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--vf-pine)] transition hover:bg-[#f8f5ee]"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <ConfirmButton
                      title="Eliminar cliente"
                      description={`Se eliminará “${client.razonSocial}”. Esta acción no se puede deshacer.`}
                      successMessage="Cliente eliminado"
                      onConfirm={() => remove(client.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </ConfirmButton>
                  </span>
                </td>
              </tr>
            ))}
            {clients?.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-[var(--vf-muted)]" colSpan={5}>
                  No hay clientes.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
