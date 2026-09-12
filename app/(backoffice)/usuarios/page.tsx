"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmButton } from "@/components/ConfirmButton";
import { PencilIcon, TrashIcon } from "@/components/icons";
import type { UserRecord } from "@/components/UserForm";
import { apiFetch, errorToastMessage } from "@/lib/api-client";
import { formatRut } from "@/lib/format";

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserRecord[] | null>(null);

  async function load() {
    try {
      setUsers(await apiFetch<UserRecord[]>("/api/users"));
    } catch (error) {
      toast.error(errorToastMessage(error));
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function remove(id: number) {
    await apiFetch(`/api/users/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Usuarios</h1>
          <p className="mt-1 text-[var(--vf-muted)]">
            Administradores con correo @ventasfix.cl
          </p>
        </div>
        <Link
          href="/usuarios/nuevo"
          className="rounded-lg bg-[var(--vf-pine)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--vf-pine-2)]"
        >
          Nuevo usuario
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--vf-line)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f8f5ee] text-[var(--vf-muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">RUT</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id} className="border-t border-[var(--vf-line)]">
                <td className="px-4 py-3 font-mono text-[13px]">
                  {formatRut(user.rut)}
                </td>
                <td className="px-4 py-3">
                  {user.nombre} {user.apellido}
                </td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-end gap-1">
                    <Link
                      href={`/usuarios/${user.id}`}
                      aria-label="Editar"
                      title="Editar"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--vf-pine)] transition hover:bg-[#f8f5ee]"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <ConfirmButton
                      title="Eliminar usuario"
                      description={`Se eliminará a ${user.nombre} ${user.apellido}. Esta acción no se puede deshacer.`}
                      successMessage="Usuario eliminado"
                      onConfirm={() => remove(user.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </ConfirmButton>
                  </span>
                </td>
              </tr>
            ))}
            {users?.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-[var(--vf-muted)]" colSpan={4}>
                  No hay usuarios.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
