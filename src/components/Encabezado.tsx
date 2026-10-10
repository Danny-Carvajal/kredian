import Link from "next/link";
import { Marca } from "@/components/Marca";

export function Encabezado() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        <Marca />
        <Link
          href="/login"
          className="inline-flex h-10 items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Entrar
        </Link>
      </div>
    </header>
  );
}
