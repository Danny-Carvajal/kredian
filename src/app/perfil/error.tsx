"use client";

import { EstadoError } from "@/components/EstadoError";

export default function ErrorPerfil({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <EstadoError titulo="No se pudo cargar el perfil" error={error} retry={reset} />;
}
