"use client";

import { EstadoError } from "@/components/EstadoError";

export default function ErrorLogin({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <EstadoError titulo="No se pudo cargar el ingreso" error={error} retry={reset} />;
}
