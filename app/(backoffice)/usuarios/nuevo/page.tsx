import { BackLink } from "@/components/BackLink";
import { UserForm } from "@/components/UserForm";

export default function NuevoUsuarioPage() {
  return (
    <div>
      <BackLink href="/usuarios" label="Volver a usuarios" />
      <h1 className="text-3xl font-semibold tracking-tight">Nuevo usuario</h1>
      <p className="mt-1 mb-6 text-[var(--vf-muted)]">
        Todos los campos son obligatorios. El email debe ser @ventasfix.cl.
      </p>
      <UserForm />
    </div>
  );
}
