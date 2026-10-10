import type { ReactNode } from "react";
import { esRango, InsigniaRango, type Rango } from "@/components/InsigniaRango";

export type EstadoInsignia = "vigente" | "vencida" | "revocada";

export type EstadoSello = "pendiente" | "verificado" | "no_verificado";

const ESTADO: Record<EstadoInsignia, { etiqueta: string; clase: string }> = {
  vigente: { etiqueta: "Vigente", clase: "bg-ink/10 text-ink" },
  vencida: { etiqueta: "Vencida", clase: "bg-line text-muted" },
  revocada: { etiqueta: "Revocada", clase: "bg-red-50 text-red-900" },
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
  return { etiqueta: estado, clase: "bg-line text-muted" };
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
    <article className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <div className="h-1.5 bg-seal" />
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">
            {ejemplo ? "Ejemplo · Credly" : "Credly"}
          </p>
          {rangoVisible ? <InsigniaRango rango={rangoVisible} tamano="sm" /> : null}
        </div>

        <div>
          <h3 className="text-lg font-semibold leading-snug text-ink">{titulo}</h3>
          <p className="mt-1 text-sm text-muted">{emisor}</p>
        </div>

        <dl className="grid gap-2 text-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <dt className="text-muted">Emisión</dt>
            <dd className="font-medium text-foreground">{fecha ? fechaVisible(fecha) : "Sin fecha"}</dd>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="text-muted">Insignia</dt>
            <dd>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${pill.clase}`}>
                {pill.etiqueta}
              </span>
            </dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <dt className="text-muted">Sello</dt>
            <dd className="font-medium text-foreground">{SELLO[estadoSello]}</dd>
          </div>
        </dl>

        <div className="hueco-sello flex flex-wrap items-center gap-3 border-t border-line pt-4">
          {comprobar ?? (
            <button
              type="button"
              disabled
              title={ejemplo ? "Ejemplo visual" : undefined}
              className="inline-flex h-9 cursor-default items-center rounded-full bg-ink px-4 text-sm font-semibold text-white disabled:opacity-100"
            >
              Comprobar sello
            </button>
          )}
          {etherscanUrl ? (
            <a
              href={etherscanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-ink underline underline-offset-4"
            >
              Ver en Etherscan
            </a>
          ) : (
            <span className="text-sm text-muted">Ver en Etherscan</span>
          )}
        </div>
      </div>
    </article>
  );
}
