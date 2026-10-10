"use client";

import { EstadoError } from "@/components/EstadoError";

export default function ErrorInicio({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <EstadoError titulo="No se pudo cargar el inicio" error={error} retry={retry} />;
}
