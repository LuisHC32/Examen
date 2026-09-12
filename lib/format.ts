export function clp(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatRut(value: string): string {
  const [cuerpo, dv] = value.split("-");
  if (!cuerpo || !dv) return value;
  const dotted = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${dotted}-${dv}`;
}
