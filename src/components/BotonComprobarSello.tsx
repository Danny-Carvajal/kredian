"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const ETHERSCAN_BASE_URL = "https://sepolia.etherscan.io";

export interface DatosCredencialSello {
  fuente: string;
  badge_id: string;
  titulo: string;
  emisor: string;
  fecha_emision: string;
  estado: string;
  verificado_en?: string;
  sellado_en?: string;
}

interface PropsComprobarSello {
  /** Hash guardado en `credenciales.hash`. */
  hash?: string | null;
  /** Transacción guardada en `credenciales.tx_hash` (para el link a Etherscan). */
  txHash?: string | null;
  /**
   * Datos guardados de la credencial. Si se pasan, el servidor RECALCULA el hash
   * (sección 7 de PROYECTO.md) y lo compara con `hash`. Es la forma recomendada.
   */
  datosCredencial?: DatosCredencialSello;
}

interface Resultado {
  verificado: boolean;
  mensaje: string;
  fecha?: string;
  etherscanUrl?: string;
}

function formatearFecha(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat("es-CR", { dateStyle: "long", timeStyle: "short" }).format(d);
  } catch {
    return iso;
  }
}

/**
 * Botón "Comprobar sello" + link a Etherscan, para cada credencial del perfil público.
 * Consulta /api/comprobar (solo lectura, no gasta gas ni necesita wallet).
 */
export default function BotonComprobarSello({ hash, txHash, datosCredencial }: PropsComprobarSello) {
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Limpiar peticiones pendientes al desmontar el componente
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const sinDatos = !hash && !datosCredencial;

  const comprobar = useCallback(async () => {
    if (sinDatos) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setCargando(true);
    setResultado(null);

    try {
      const res = await fetch("/api/comprobar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...(datosCredencial ?? {}), ...(hash ? { hash } : {}) }),
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResultado({
          verificado: false,
          mensaje: data.error || "No se pudo conectar con la blockchain. Probá de nuevo.",
        });
      } else {
        setResultado({
          verificado: Boolean(data.verificado),
          mensaje: data.mensaje,
          fecha: data.sellado_en_fecha,
          etherscanUrl: data.etherscan_contract_url,
        });
      }
    } catch (err: unknown) {
      if ((err as { name?: string })?.name !== "AbortError") {
        setResultado({
          verificado: false,
          mensaje: "Error de red al comprobar el sello. Revisá tu conexión.",
        });
      }
    } finally {
      setCargando(false);
    }
  }, [datosCredencial, hash, sinDatos]);

  const cleanTxHash = txHash?.trim();
  const linkEtherscan = cleanTxHash
    ? `${ETHERSCAN_BASE_URL}/tx/${cleanTxHash.startsWith("0x") ? cleanTxHash : `0x${cleanTxHash}`}`
    : resultado?.etherscanUrl;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={comprobar}
          disabled={cargando || sinDatos}
          aria-busy={cargando}
          className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {cargando ? (
            <>
              <span
                aria-hidden
                className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"
              />
              Consultando Sepolia…
            </>
          ) : (
            <>
              <span aria-hidden>🛡️</span>
              Comprobar sello
            </>
          )}
        </button>

        {linkEtherscan && (
          <a
            href={linkEtherscan}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-zinc-500 underline hover:text-indigo-600"
          >
            {txHash ? "Ver transacción en Etherscan ↗" : "Ver contrato en Etherscan ↗"}
          </a>
        )}
      </div>

      <div aria-live="polite">
        {resultado && (
          <div
            className={`rounded-md border p-2.5 text-xs ${
              resultado.verificado
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <p className="font-semibold">
              {resultado.verificado ? "✅ Sello verificado" : "❌ Sello no verificado"}
            </p>
            <p className="mt-0.5">{resultado.mensaje}</p>
            {resultado.fecha && (
              <p className="mt-1 text-[11px] text-zinc-600">
                Sellado en Sepolia el {formatearFecha(resultado.fecha)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
