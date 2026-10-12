import Link from "next/link";

export function Sello({ tamano = 32 }: { tamano?: number }) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="15" fill="#4e9a6a" />
      <circle cx="16" cy="16" r="12.2" fill="none" stroke="#f3ead8" strokeWidth="1.1" />
      <circle cx="16" cy="16" r="9.4" fill="none" stroke="#c4894a" strokeWidth="1.15" />
      <path
        d="M12.2 9.1v13.8M12.2 16.1 20.8 9.1M12.2 16.1 20.8 22.9"
        fill="none"
        stroke="#f3ead8"
        strokeWidth="2.05"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

export function Hoja({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M10 38c12-18 16-28 6-34 16 8 24 22 22 34-12 4-20 6-28 0z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M16 12c6 8 8 16 6 26"
        stroke="#07140f"
        strokeWidth="1.4"
        opacity="0.45"
      />
    </svg>
  );
}

export function Marca({ tamano = 32 }: { tamano?: number }) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 text-ink sm:gap-2.5"
    >
      <Sello tamano={tamano} />
      <span className="font-display text-lg tracking-tight sm:text-xl">Kredian</span>
    </Link>
  );
}
