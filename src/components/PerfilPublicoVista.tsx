import Link from "next/link";
import BotonComprobarSello from "@/components/BotonComprobarSello";
import {
  datosParaComprobar,
  soloSelladas,
  urlFotoSegura,
  type CredencialVisible,
} from "@/lib/credencial-publica";

export type PerfilVisible = {
  nombre: string | null;
  usuario: string;
  foto_url: string | null;
  descripcion: string | null;
};

function textoRango(rango: string | null): string | null {
  if (!rango?.trim()) return null;
  const limpio = rango.trim();
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

export default function PerfilPublicoVista({
  perfil,
  credenciales,
}: {
  perfil: PerfilVisible;
  credenciales: CredencialVisible[];
}) {
  const selladas = soloSelladas(credenciales);
  const foto = urlFotoSegura(perfil.foto_url);
  const titulo = perfil.nombre?.trim() || perfil.usuario;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-4">
        <Link href="/" className="text-sm text-zinc-500 underline">
          Kredian
        </Link>
        <div className="flex items-center gap-4">
          {foto ? (
            // La foto viene de una URL que pegó el usuario; no pasa por el optimizador.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={foto}
              alt={titulo}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : null}
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{titulo}</h1>
            <p className="text-sm text-zinc-500">@{perfil.usuario}</p>
          </div>
        </div>
        {perfil.descripcion?.trim() ? (
          <p className="text-zinc-600 dark:text-zinc-400">{perfil.descripcion}</p>
        ) : null}
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-medium">Sellos</h2>
        {selladas.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Todavía no hay credenciales selladas.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {selladas.map((credencial) => {
              const rango = textoRango(credencial.rango);
              const datos = datosParaComprobar(credencial);
              return (
                <li
                  key={credencial.id}
                  className="flex flex-col gap-3 rounded-2xl border border-zinc-200 px-4 py-4 dark:border-zinc-800"
                >
                  <div>
                    <p className="font-medium">{credencial.titulo ?? "Credencial"}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {[credencial.emisor, credencial.estado, credencial.fecha_emision]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {rango ? (
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        Rango: {rango}
                      </p>
                    ) : null}
                  </div>
                  {/*
                    BotonComprobarSello recalcula el hash con sellado_en (= verificado_en)
                    y, si hay tx_hash, muestra https://sepolia.etherscan.io/tx/{tx_hash}.
                  */}
                  <BotonComprobarSello
                    hash={credencial.hash}
                    txHash={credencial.tx_hash}
                    datosCredencial={datos ?? undefined}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
