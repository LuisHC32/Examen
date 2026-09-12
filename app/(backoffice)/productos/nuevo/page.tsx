import { BackLink } from "@/components/BackLink";
import { ProductForm } from "@/components/ProductForm";

export default function NuevoProductoPage() {
  return (
    <div>
      <BackLink href="/productos" label="Volver a productos" />
      <h1 className="text-3xl font-semibold tracking-tight">Nuevo producto</h1>
      <p className="mt-1 mb-6 text-[var(--vf-muted)]">
        La imagen se guarda en disco; en la base de datos solo queda la ruta.
      </p>
      <ProductForm />
    </div>
  );
}
