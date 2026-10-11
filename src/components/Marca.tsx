import Link from "next/link";

export function Sello({ tamano = 32 }: { tamano?: number }) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="15" fill="#123f38" />
      <circle
        cx="16"
        cy="16"
        r="12"
        fill="none"
        stroke="#b8893a"
        strokeWidth="1.35"
      />
      <path
        d="M12.2 9.1v13.8M12.2 16.1 20.8 9.1M12.2 16.1 20.8 22.9"
        fill="none"
        stroke="#f3f6f4"
        strokeWidth="2.15"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

export function Marca({ tamano = 32 }: { tamano?: number }) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 text-ink"
    >
      <Sello tamano={tamano} />
      <span className="text-lg font-semibold tracking-tight">Kredian</span>
    </Link>
  );
}
