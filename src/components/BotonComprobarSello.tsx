"use client";

import { useState } from "react";

interface PropsComprobarSello {
  hash?: string;
  txHash?: string;
  // O los datos para recalcularlo si se requiere
  datosCredencial?: {
    fuente: string;
    badge_id: string;
    titulo: string;
    emisor: string;
    fecha_emision: string;
    estado: string;
    verificado_en: string;
  };
}

export default function BotonComprobarSello({
  hash,
  txHash,
  datosCredencial,
}: PropsComprobarSello) {
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState<{
    verificado?: boolean;
    mensaje?: string;
    fecha?: string;
    etherscanUrl?: string;
  } | null>(null);

  const comprobar = async () => {
    setCargando(true);
    setResultado(null);
    try {
      const res = await fetch("/api/comprobar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hash ? { hash } : datosCredencial),
      });

      const data = await res.json();
      if (!res.ok) {
        setResultado({
          verificado: false,
          mensaje: data.error || "Error al conectar con la blockchain",
        });
      } else {
        setResultado({
          verificado: data.verificado,
          mensaje: data.mensaje,
          fecha: data.sellado_en_fecha,
          etherscanUrl: data.etherscan_contract_url,
        });
      }
    } catch {
      setResultado({
        verificado: false,
        mensaje: "Error de red al comprobar el sello",
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <button
          onClick={comprobar}
          disabled={cargando}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {cargando ? (
            <>
              <span className="inline-block w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
              Consultando Sepolia...
            </>
          ) : (
            <>
              <span>🛡️</span>
              Comprobar sello
            </>
          )}
        </button>

        {txHash && (
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-indigo-600 underline flex items-center gap-1"
          >
            Ver en Etherscan ↗
          </a>
        )}
      </div>

      {resultado && (
        <div
          className={`text-xs p-2.5 rounded-md border ${
            resultado.verificado
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="font-semibold flex items-center gap-1">
            {resultado.verificado ? "✅ Sello Válido e Inmutable" : "❌ No verificado"}
          </div>
          <p className="mt-0.5">{resultado.mensaje}</p>
          {resultado.fecha && (
            <p className="mt-1 text-[11px] text-gray-600">
              Sellado en bloque: {new Date(resultado.fecha).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
