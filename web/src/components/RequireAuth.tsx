import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { apiFetch } from "@/lib/api-client";

export function RequireAuth({ children }: { children: ReactNode }) {
  const [state, setState] = useState<"loading" | "ok" | "anon">("loading");

  useEffect(() => {
    let cancelled = false;
    apiFetch("/api/auth/me")
      .then(() => {
        if (!cancelled) setState("ok");
      })
      .catch(() => {
        if (!cancelled) setState("anon");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "loading") {
    return <p className="p-8 text-[var(--vf-muted)]">Cargando…</p>;
  }
  if (state === "anon") {
    return <Navigate to="/login" replace />;
  }
  return children;
}

