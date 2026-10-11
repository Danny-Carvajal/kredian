"use client";

import { EstadoError } from "@/components/EstadoError";

export default function ErrorInicio({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <EstadoError titulo="No se pudo cargar el inicio" error={error} retry={reset} />;
}
