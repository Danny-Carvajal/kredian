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
    <section className="papel rounded-[1.75rem] border border-black/10 p-6 text-paper-ink shadow-[0_28px_70px_-36px_rgba(12,28,20,0.65)]">
      {ejemplo ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-seal">Papel de ejemplo</p>
      ) : null}

      <div className={`flex items-center gap-3 ${ejemplo ? "mt-3" : ""}`}>
        {fotoUrl ? (
          // La foto viene de una URL que pega el usuario; no hay dominios fijos para next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fotoUrl}
            alt=""
            className="h-14 w-14 rounded-full border border-seal/40 object-cover"
          />
        ) : (
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-seal text-base font-semibold text-[#06210f]">
            {iniciales(nombre)}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="font-display truncate text-2xl">{nombre}</h2>
          <p className="truncate text-sm text-[#5e6f68]">/u/{usuario}</p>
        </div>
      </div>

      {descripcion ? <p className="mt-4 text-sm leading-6 text-[#5e6f68]">{descripcion}</p> : null}

      {error ? (
        <p role="alert" className="mt-4 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-3">
        {credenciales.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/15 px-4 py-6 text-sm text-[#5e6f68]">
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
