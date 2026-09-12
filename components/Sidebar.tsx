"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch, errorToastMessage } from "@/lib/api-client";
import { toast } from "sonner";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/usuarios", label: "Usuarios" },
  { href: "/productos", label: "Productos" },
  { href: "/clientes", label: "Clientes" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
      toast.success("Sesión cerrada");
      router.replace("/login");
      router.refresh();
    } catch (error) {
      toast.error(errorToastMessage(error));
    }
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-[var(--vf-pine)] text-[#e8efe9]">
      <div className="border-b border-white/10 px-6 py-7">
        <p className="text-[11px] font-semibold tracking-[0.22em] text-[var(--vf-gold)] uppercase">
          VentasFix
        </p>
        <h1 className="mt-1 font-semibold text-xl tracking-tight">Backoffice</h1>
        <p className="mt-2 text-sm text-white/55">Gestión comercial interna</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-5">
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-[var(--vf-gold)] text-[var(--vf-pine)]"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <button
          type="button"
          onClick={logout}
          className="w-full rounded-lg border border-white/15 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
