export type ParsedRut = {
  cuerpo: string;
  dv: string;
  formatted: string;
};

function computeDv(cuerpo: string): string {
  let suma = 0;
  let factor = 2;
  for (let i = cuerpo.length - 1; i >= 0; i -= 1) {
    suma += Number(cuerpo[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const resto = suma % 11;
  const dv = 11 - resto;
  if (dv === 11) return "0";
  if (dv === 10) return "K";
  return String(dv);
}

export function parseRut(input: string): ParsedRut | null {
  if (typeof input !== "string") return null;
  const compacto = input.replace(/[.\s-]/g, "").toUpperCase();
  if (compacto.length < 8) return null;
  const dv = compacto.slice(-1);
  const cuerpo = compacto.slice(0, -1);
  if (!/^\d{7,9}$/.test(cuerpo)) return null;
  if (!/^[0-9K]$/.test(dv)) return null;
  if (computeDv(cuerpo) !== dv) return null;
  return { cuerpo, dv, formatted: `${cuerpo}-${dv}` };
}

export function normalizeRut(input: string): string | null {
  return parseRut(input)?.formatted ?? null;
}
