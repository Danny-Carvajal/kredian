"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Pide POST /api/sellar con solo `credencial_id`.
 * La ruta exige la sesión (la cookie viaja sola) y lee la fila en el servidor.
 */
export default function BotonSellar({ credencialId }: { credencialId: string }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sellar() {
    setCargando(true);
    setError(null);

    try {
      const res = await fetch("/api/sellar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credencial_id: credencialId }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "No se pudo sellar. Probá de nuevo.");
        return;
      }
      router.refresh();
    } catch {
      setError("Error de red al sellar. Revisá tu conexión.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={sellar}
        disabled={cargando}
        aria-busy={cargando}
        className="inline-flex h-10 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background disabled:opacity-60"
      >
        {cargando ? "Sellando en Sepolia…" : "Sellar"}
      </button>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
