import type { ReactNode } from "react";
import { esRango, InsigniaRango, type Rango } from "@/components/InsigniaRango";

export type EstadoInsignia = "vigente" | "vencida" | "revocada";

export type EstadoSello = "pendiente" | "verificado" | "no_verificado";

const ESTADO: Record<EstadoInsignia, { etiqueta: string; clase: string }> = {
  vigente: { etiqueta: "Vigente", clase: "bg-seal/20 text-[#1c4a32]" },
  vencida: { etiqueta: "Vencida", clase: "bg-black/10 text-[#5e6f68]" },
  revocada: { etiqueta: "Revocada", clase: "bg-red-100 text-red-900" },
};

const SELLO: Record<EstadoSello, string> = {
  pendiente: "Sello pendiente de comprobar",
  verificado: "Sello verificado",
  no_verificado: "Sello no verificado",
};

function fechaVisible(fecha: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha.trim());
  if (!match) return fecha;
  const dia = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (Number.isNaN(dia.getTime())) return fecha;
  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(dia);
}

function estadoVisible(estado: string) {
  if (estado === "vigente" || estado === "vencida" || estado === "revocada") {
    return ESTADO[estado];
  }
  return { etiqueta: estado, clase: "bg-black/10 text-[#5e6f68]" };
}

export type TarjetaCredencialProps = {
  titulo: string;
  emisor: string;
  fecha: string;
  estado: EstadoInsignia | string;
  rango?: Rango | string | null;
  estadoSello?: EstadoSello;
  comprobar?: ReactNode;
  etherscanUrl?: string | null;
  ejemplo?: boolean;
};

export function TarjetaCredencial({
  titulo,
  emisor,
  fecha,
  estado,
  rango,
  estadoSello = "pendiente",
  comprobar,
  etherscanUrl,
  ejemplo = false,
}: TarjetaCredencialProps) {
  const pill = estadoVisible(estado);
  const rangoVisible = esRango(rango) ? rango : null;

  return (
    <article className="papel overflow-hidden rounded-[1.2rem] border border-black/10 text-paper-ink shadow-[0_18px_40px_-28px_rgba(28,42,36,0.55)]">
      <div className="h-1.5 bg-gradient-to-r from-wax via-seal to-seal/30" />
      <div className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-seal">
            {ejemplo ? "Ejemplo · Credly" : "Credly"}
          </p>
          {rangoVisible ? <InsigniaRango rango={rangoVisible} tamano="sm" /> : null}
        </div>

        <div>
          <h3 className="font-display text-xl leading-snug">{titulo}</h3>
          <p className="mt-1 text-sm text-[#5e6f68]">{emisor}</p>
        </div>

        <dl className="grid gap-2 text-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <dt className="text-[#5e6f68]">Emisión</dt>
            <dd className="font-medium">{fecha ? fechaVisible(fecha) : "Sin fecha"}</dd>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="text-[#5e6f68]">Insignia</dt>
            <dd>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${pill.clase}`}>
                {pill.etiqueta}
              </span>
            </dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <dt className="text-[#5e6f68]">Sello</dt>
            <dd className="font-medium">{SELLO[estadoSello]}</dd>
          </div>
        </dl>

        <div className="hueco-sello flex flex-wrap items-center gap-3 border-t border-black/10 pt-4">
          {comprobar ?? (
            <button
              type="button"
              disabled
              title={ejemplo ? "Ejemplo visual" : undefined}
              className="inline-flex h-9 cursor-default items-center rounded-full bg-wax px-4 text-sm font-semibold text-[#1a1408] disabled:opacity-100"
            >
              Comprobar sello
            </button>
          )}
          {etherscanUrl ? (
            <a
              href={etherscanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-wax underline underline-offset-4"
            >
              Ver en Etherscan
            </a>
          ) : (
            <span className="text-sm text-[#5e6f68]">Ver en Etherscan</span>
          )}
        </div>
      </div>
    </article>
  );
}
