import { EstadoCarga } from "@/components/EstadoCarga";
import { Sello } from "@/components/Marca";
import { TarjetaCredencial, type TarjetaCredencialProps } from "@/components/TarjetaCredencial";

export type PerfilPublicoProps = {
  nombre: string;
  usuario: string;
  descripcion?: string | null;
  fotoUrl?: string | null;
  credenciales: TarjetaCredencialProps[];
  ejemplo?: boolean;
  cargando?: boolean;
  error?: string | null;
};

function iniciales(nombre: string) {
  const partes = nombre.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (partes.length === 0) return "K";
  return partes.map((parte) => parte[0]?.toUpperCase() ?? "").join("");
}

export function PerfilPublico({
  nombre,
  usuario,
  descripcion,
  fotoUrl,
  credenciales,
  ejemplo = false,
  cargando = false,
  error = null,
}: PerfilPublicoProps) {
  if (cargando) {
    return <EstadoCarga variante="publico" />;
  }

  return (
    <section className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
      {ejemplo ? (
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">Ejemplo</p>
      ) : null}

      <div className={`flex items-center gap-3 ${ejemplo ? "mt-3" : ""}`}>
        {fotoUrl ? (
          // La foto viene de una URL que pega el usuario; no hay dominios fijos para next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fotoUrl}
            alt=""
            className="h-14 w-14 rounded-full border border-line object-cover"
          />
        ) : (
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-ink text-base font-semibold text-white">
            {iniciales(nombre)}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-ink">{nombre}</h2>
          <p className="truncate text-sm text-muted">/u/{usuario}</p>
        </div>
      </div>

      {descripcion ? <p className="mt-4 text-sm leading-6 text-muted">{descripcion}</p> : null}

      {error ? (
        <p role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-3">
        {credenciales.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line px-4 py-6 text-sm text-muted">
            <span className="mb-3 inline-flex">
              <Sello tamano={28} />
            </span>
            <p>Todavía no hay insignias en este perfil.</p>
          </div>
        ) : (
          credenciales.map((credencial, indice) => (
            <TarjetaCredencial key={credencial.titulo + indice} {...credencial} ejemplo={ejemplo || credencial.ejemplo} />
          ))
        )}
      </div>
    </section>
  );
}
