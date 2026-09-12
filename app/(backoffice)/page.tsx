"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiFetch, errorToastMessage } from "@/lib/api-client";

type Counts = { users: number; products: number; clients: number };

export default function DashboardPage() {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    apiFetch<Counts>("/api/dashboard")
      .then(setCounts)
      .catch((error) => toast.error(errorToastMessage(error)));
  }, []);

  const cards = [
    { label: "Usuarios", value: counts?.users, href: "/usuarios" },
    { label: "Productos", value: counts?.products, href: "/productos" },
    { label: "Clientes", value: counts?.clients, href: "/clientes" },
  ];

  return (
    <div>
      <p className="text-sm font-medium tracking-wide text-[var(--vf-muted)] uppercase">
        Resumen
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-2 max-w-2xl text-[var(--vf-muted)]">
        Conteos del backoffice. La API REST autenticada expone los mismos
        recursos para Softland u otros integradores.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-[var(--vf-line)] bg-white p-6 shadow-[0_10px_30px_-24px_rgba(16,36,31,0.45)] transition hover:-translate-y-0.5"
          >
            <p className="text-sm text-[var(--vf-muted)]">{card.label}</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight">
              {card.value ?? "—"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
