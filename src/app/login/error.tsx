"use client";

import { EstadoError } from "@/components/EstadoError";

export default function ErrorLogin({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <EstadoError titulo="No se pudo cargar el ingreso" error={error} retry={retry} />;
}
