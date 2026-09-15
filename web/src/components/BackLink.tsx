import { Link } from "react-router-dom";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      to={href}
      className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--vf-muted)] hover:text-[var(--vf-ink)]"
    >
      <span aria-hidden="true">←</span>
      {label}
    </Link>
  );
}
