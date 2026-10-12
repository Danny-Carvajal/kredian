import BotonComprobarSello from "@/components/BotonComprobarSello";
import { PerfilPublico } from "@/components/PerfilPublico";
import {
  datosParaComprobar,
  linkTransaccion,
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
    <div className="mx-auto flex w-full max-w-xl min-w-0 flex-1 flex-col gap-8 px-4 py-10 sm:px-6 sm:py-16">
      <PerfilPublico
        nombre={titulo}
        usuario={perfil.usuario}
        descripcion={perfil.descripcion}
        fotoUrl={foto}
        credenciales={selladas.map((credencial) => {
          const datos = datosParaComprobar(credencial);
          return {
            titulo: credencial.titulo ?? "Credencial",
            emisor: credencial.emisor ?? "",
            fecha: credencial.fecha_emision ?? "",
            estado: credencial.estado ?? "vigente",
            rango: credencial.rango,
            estadoSello: "verificado" as const,
            comprobar: (
              <BotonComprobarSello
                hash={credencial.hash}
                txHash={credencial.tx_hash}
                datosCredencial={datos ?? undefined}
              />
            ),
            etherscanUrl: linkTransaccion(credencial.tx_hash),
          };
        })}
      />
    </div>
  );
}
