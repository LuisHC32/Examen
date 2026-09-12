"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { errorToastMessage } from "@/lib/api-client";

export function ConfirmButton({
  label = "Eliminar",
  title,
  description = "Esta acción no se puede deshacer.",
  confirmLabel = "Eliminar",
  successMessage,
  onConfirm,
  children,
}: {
  label?: string;
  title: string;
  description?: string;
  confirmLabel?: string;
  successMessage: string;
  onConfirm: () => Promise<void> | void;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, pending]);

  async function confirm() {
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
      toast.success(successMessage);
    } catch (error) {
      toast.error(errorToastMessage(error));
    } finally {
      setPending(false);
    }
  }

  const dialog =
    open && mounted
      ? createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              aria-label="Cerrar"
              disabled={pending}
              className="absolute inset-0 bg-[var(--vf-pine)]/45"
              onClick={() => {
                if (!pending) setOpen(false);
              }}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="relative w-full max-w-md rounded-2xl border border-[var(--vf-line)] bg-white p-6 shadow-[0_24px_60px_-28px_rgba(16,36,31,0.55)]"
            >
              <h2 id={titleId} className="text-xl font-semibold tracking-tight">
                {title}
              </h2>
              <p className="mt-2 text-sm text-[var(--vf-muted)]">{description}</p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-[var(--vf-line)] px-4 py-2 text-sm font-medium hover:bg-[#f8f5ee] disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => void confirm()}
                  className="rounded-lg bg-[var(--vf-danger)] px-4 py-2 text-sm font-medium text-white hover:bg-[#8f1c13] disabled:opacity-60"
                >
                  {pending ? "Eliminando…" : confirmLabel}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label}
        title={label}
        className={
          children
            ? "inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--vf-danger)] transition hover:bg-[#fde8e6]"
            : "text-sm font-medium text-[var(--vf-danger)] hover:underline"
        }
      >
        {children ?? label}
      </button>
      {dialog}
    </>
  );
}
