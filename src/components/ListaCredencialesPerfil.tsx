import Link from "next/link";
import BotonSellar from "@/components/BotonSellar";
import {
  debeMostrarBotonSellar,
  linkTransaccion,
  type CredencialVisible,
} from "@/lib/credencial-publica";

export default function ListaCredencialesPerfil({
  usuario,
  credenciales,
  error,
}: {
  usuario: string;
  credenciales: CredencialVisible[];
  error: string | null;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-medium">Tus credenciales</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Si una todavía no tiene sello, podés mandarla a Sepolia. El perfil
          público está en{" "}
          <Link href={`/u/${usuario}`} className="underline">
            /u/{usuario}
          </Link>
          .
        </p>
      </div>

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {!error && credenciales.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Todavía no hay credenciales guardadas. Cuando exista una fila tuya,
          acá aparece el botón Sellar.
        </p>
      ) : null}

      <ul className="flex flex-col gap-3">
        {credenciales.map((credencial) => {
          const tx = linkTransaccion(credencial.tx_hash);
          return (
            <li
              key={credencial.id}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-200 px-4 py-4 dark:border-zinc-800"
            >
              <div>
                <p className="font-medium">{credencial.titulo ?? "Credencial"}</p>
                {credencial.emisor ? (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{credencial.emisor}</p>
                ) : null}
              </div>
              {debeMostrarBotonSellar(credencial) ? (
                <BotonSellar credencialId={credencial.id} />
              ) : (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Sellada.
                  {tx ? (
                    <>
                      {" "}
                      <a
                        href={tx}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Ver en Etherscan
                      </a>
                    </>
                  ) : null}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
