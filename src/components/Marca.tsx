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
        d="M24 2.4C36.5 9.2 43.2 21.5 40.4 34.2C38.2 42.2 31.4 46.6 24 46.6C16.6 46.6 9.8 42.2 7.6 34.2C4.8 21.5 11.5 9.2 24 2.4Z"
        fill="currentColor"
        opacity="0.9"
      />
      <g
        stroke="#07140f"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.42"
      >
        <path d="M24 6.2V44.4" strokeWidth="1.35" />
        <path d="M24 15L33.2 22.2M24 15L14.8 22.2" strokeWidth="1" />
        <path d="M24 25.2L33.8 32.6M24 25.2L14.2 32.6" strokeWidth="1" />
        <path d="M24 34.6L31 40.2M24 34.6L17 40.2" strokeWidth="1" />
      </g>
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
