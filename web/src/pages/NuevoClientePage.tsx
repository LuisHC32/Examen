import { BackLink } from "@/components/BackLink";
import { ClientForm } from "@/components/ClientForm";

export function NuevoClientePage() {
  return (
    <div>
      <BackLink href="/clientes" label="Volver a clientes" />
      <h1 className="text-3xl font-semibold tracking-tight">Nuevo cliente</h1>
      <p className="mt-1 mb-6 text-[var(--vf-muted)]">
        El email de contacto no necesita ser @ventasfix.cl.
      </p>
      <ClientForm />
    </div>
  );
}
