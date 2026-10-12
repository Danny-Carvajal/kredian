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
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-seal">Kredian</p>
      <h1 className="font-display text-3xl text-ink">{titulo}</h1>
      <p className="text-base leading-7 text-muted">
        No pudimos cargar esta pantalla. Probá de nuevo en un momento.
      </p>
      {error.digest ? <p className="text-xs text-muted">Código: {error.digest}</p> : null}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex h-11 items-center justify-center rounded-full bg-seal px-5 text-sm font-semibold text-[#1a1408] transition hover:brightness-110"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-full border border-line px-5 text-sm font-medium text-ink"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
