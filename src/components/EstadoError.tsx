"use client";

import Link from "next/link";
import { useEffect } from "react";

export function EstadoError({
  titulo,
  error,
  retry,
}: {
  titulo: string;
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-start gap-4 px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ink">Kredian</p>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{titulo}</h1>
      <p className="text-base leading-7 text-muted">
        No pudimos cargar esta pantalla. Probá de nuevo en un momento.
      </p>
      {error.digest ? <p className="text-xs text-muted">Código: {error.digest}</p> : null}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-full border border-ink px-5 text-sm font-medium text-ink"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
