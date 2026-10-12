import Link from "next/link";
import { Aviso } from "@/components/Aviso";
import BotonSellar from "@/components/BotonSellar";
import { TarjetaCredencial } from "@/components/TarjetaCredencial";
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
        <h2 className="font-display text-2xl text-ink">Tus credenciales</h2>
        <p className="mt-1 text-sm text-muted">
          Si una todavía no tiene sello, mandala a Sepolia. El perfil público está en{" "}
          <Link href={`/u/${usuario}`} className="font-medium text-ink underline underline-offset-4">
            /u/{usuario}
          </Link>
          .
        </p>
      </div>

      {error ? <Aviso tono="error">{error}</Aviso> : null}

      {!error && credenciales.length === 0 ? (
        <p className="text-sm text-muted">
          Todavía no hay credenciales. Pegá un link de Credly arriba.
        </p>
      ) : null}

      <ul className="flex flex-col gap-3">
        {credenciales.map((credencial) => {
          const tx = linkTransaccion(credencial.tx_hash);
          const sellar = debeMostrarBotonSellar(credencial);
          return (
            <li key={credencial.id}>
              <TarjetaCredencial
                titulo={credencial.titulo ?? "Credencial"}
                emisor={credencial.emisor ?? ""}
                fecha={credencial.fecha_emision ?? ""}
                estado={credencial.estado ?? "vigente"}
                rango={credencial.rango}
                estadoSello={sellar ? "pendiente" : "verificado"}
                comprobar={sellar ? <BotonSellar credencialId={credencial.id} /> : undefined}
                etherscanUrl={tx}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
