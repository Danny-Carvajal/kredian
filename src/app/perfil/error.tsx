"use client";

import { EstadoError } from "@/components/EstadoError";

export default function ErrorPerfil({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <EstadoError titulo="No se pudo cargar tu perfil" error={error} retry={retry} />;
}