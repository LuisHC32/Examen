import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="hidden bg-[var(--vf-pine)] px-14 py-16 text-[#e8efe9] lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-[var(--vf-gold)] uppercase">
            VentasFix
          </p>
          <h1 className="mt-8 max-w-md text-4xl font-semibold leading-tight tracking-tight">
            Backoffice para la venta online
          </h1>
          <p className="mt-4 max-w-sm text-white/65">
            Administra usuarios, productos con IVA y clientes empresa. La misma
            API queda lista para integradores.
          </p>
        </div>
        <p className="text-sm text-white/40">Chile · precios en CLP · IVA 19%</p>
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <Outlet />
      </section>
    </div>
  );
}
