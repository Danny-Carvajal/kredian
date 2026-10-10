import { notFound } from "next/navigation";
import PerfilPublicoVista, { type PerfilVisible } from "@/components/PerfilPublicoVista";
import { mapearCredencial, type CredencialVisible } from "@/lib/credencial-publica";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ usuario: string }>;
};

function usuarioDeParam(valor: string): string {
  try {
    return decodeURIComponent(valor).trim();
  } catch {
    return valor.trim();
  }
}

export default async function PerfilPublicoPage({ params }: Props) {
  const { usuario: crudo } = await params;
  const usuario = usuarioDeParam(crudo);
  if (!usuario) notFound();

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-6 py-16">
        <h1 className="text-3xl font-semibold">Perfil</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Configurá Supabase en `.env.local` y corré `supabase/schema.sql` para
          ver perfiles públicos.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: fila, error } = await supabase
    .from("profiles")
    .select("id, nombre, usuario, foto_url, descripcion")
    .eq("usuario", usuario)
    .maybeSingle();

  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-6 py-16">
        <h1 className="text-3xl font-semibold">Perfil</h1>
        <p className="text-zinc-600 dark:text-zinc-400">No se pudo leer el perfil.</p>
      </div>
    );
  }

  if (!fila) notFound();

  const { data: filas, error: errorCredenciales } = await supabase
    .from("credenciales")
    .select(
      "id, fuente, badge_id, titulo, emisor, fecha_emision, estado, hash, tx_hash, sellado_en, rango",
    )
    .eq("user_id", fila.id)
    .not("hash", "is", null);

  if (errorCredenciales) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-6 py-16">
        <h1 className="text-3xl font-semibold">{fila.nombre || fila.usuario}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">No se pudieron leer las credenciales.</p>
      </div>
    );
  }

  const perfil: PerfilVisible = {
    nombre: fila.nombre,
    usuario: fila.usuario,
    foto_url: fila.foto_url,
    descripcion: fila.descripcion,
  };

  const credenciales = (filas ?? [])
    .map((filaCredencial) => mapearCredencial(filaCredencial))
    .filter((credencial): credencial is CredencialVisible => credencial !== null);

  return <PerfilPublicoVista perfil={perfil} credenciales={credenciales} />;
}
