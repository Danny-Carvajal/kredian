import Link from "next/link";
import { redirect } from "next/navigation";
import { cerrarSesion } from "@/app/login/actions";
import { Aviso } from "@/components/Aviso";
import ListaCredencialesPerfil from "@/components/ListaCredencialesPerfil";
import { mapearCredencial, type CredencialVisible } from "@/lib/credencial-publica";
import { asegurarPerfil } from "@/lib/profiles";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { guardarPerfil, pegarCredly } from "./actions";

type Props = {
  searchParams: Promise<{ error?: string; ok?: string }>;
};

function textoError(codigo: string | undefined) {
  if (!codigo) return null;
  if (codigo === "config") return "Faltan las keys de Supabase.";
  if (codigo === "usuario") return "El usuario de la URL no puede estar vacío.";
  if (codigo === "tomado") return "Ese usuario ya está en uso. Probá otro.";
  if (codigo === "link") return "Pegá el link público de la insignia de Credly.";
  if (codigo === "nombre") {
    return "La insignia se guardó, pero el nombre no coincide con tu perfil. Completá tu nombre real (sin apodos) y volvé a pegar el link. No se puede sellar hasta que coincida.";
  }
  return codigo;
}

function textoOk(codigo: string | undefined) {
  if (codigo === "1") return "Perfil guardado.";
  if (codigo === "credly") {
    return "Insignia leída y nombre coincide. Dale a Sellar para mandar el hash a Sepolia.";
  }
  if (codigo === "planb") {
    return "Credly no se pudo leer desde el servidor, así que usamos el JSON de ejemplo (plan B). Si el nombre de tu perfil es «Danny Carvajal», coincide. Después dale a Sellar.";
  }
  return null;
}

const CAMPO =
  "h-11 rounded-xl border border-line bg-background/70 px-3 text-base text-foreground outline-none placeholder:text-muted/70 focus:border-seal";

export default async function PerfilPage({ searchParams }: Props) {
  const params = await searchParams;

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Tu perfil</h1>
        <Aviso tono="aviso">
          Configurá Supabase en `.env.local` y corré `supabase/schema.sql` para
          poder editar el perfil.
        </Aviso>
        <Link href="/login" className="text-sm font-medium text-ink underline underline-offset-4">
          Ir a entrar
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const perfil = await asegurarPerfil(supabase, user);
  const error = textoError(params.error);
  const ok = textoOk(params.ok);

  const { data: filasCredenciales, error: errorCredenciales } = await supabase
    .from("credenciales")
    .select(
      "id, fuente, badge_id, titulo, emisor, fecha_emision, estado, hash, tx_hash, sellado_en, rango, nombre_coincide",
    )
    .eq("user_id", user.id);

  const credenciales = (filasCredenciales ?? [])
    .map((fila) => mapearCredencial(fila))
    .filter((credencial): credencial is CredencialVisible => credencial !== null);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-ink">Tu perfil</h1>
          <p className="mt-2 text-muted">
            Este nombre se va a comparar con el de la insignia de Credly.
          </p>
        </div>
        <form action={cerrarSesion}>
          <button type="submit" className="text-sm font-medium text-ink underline underline-offset-4">
            Salir
          </button>
        </form>
      </header>

      {error ? <Aviso tono="error">{error}</Aviso> : null}
      {ok ? <Aviso tono="ok">{ok}</Aviso> : null}

      <form action={guardarPerfil} className="flex flex-col gap-4 rounded-[1.75rem] border border-line bg-surface/90 p-5">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
          Nombre
          <input name="nombre" defaultValue={perfil.nombre ?? ""} className={CAMPO} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
          Usuario (va en /u/tu-usuario)
          <input name="usuario" required defaultValue={perfil.usuario} className={CAMPO} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
          Foto (URL)
          <input
            name="foto_url"
            type="url"
            defaultValue={perfil.foto_url ?? ""}
            placeholder="https://..."
            className={CAMPO}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
          Descripción
          <textarea
            name="descripcion"
            rows={4}
            defaultValue={perfil.descripcion ?? ""}
            className="rounded-xl border border-line bg-background/70 px-3 py-2 text-base text-foreground outline-none focus:border-seal"
          />
        </label>
        <button
          type="submit"
          className="h-12 rounded-full bg-seal text-base font-semibold text-[#1a1408] transition hover:brightness-110"
        >
          Guardar
        </button>
      </form>

      <form action={pegarCredly} className="rounded-[1.5rem] border border-dashed border-seal/30 bg-surface/70 px-4 py-6">
        <h2 className="font-medium text-ink">Pegar link de Credly</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          El link tiene que ser el público de la insignia (credly.com/badges/…).
          Si Credly no deja leer, usamos el JSON de ejemplo.
        </p>
        <label className="mt-4 flex flex-col gap-1.5 text-sm font-medium text-ink">
          Link
          <input
            name="credly_url"
            type="url"
            required
            placeholder="https://www.credly.com/badges/…/public_url"
            className={CAMPO}
          />
        </label>
        <button
          type="submit"
          className="mt-4 h-12 w-full rounded-full bg-seal text-base font-semibold text-[#1a1408] transition hover:brightness-110"
        >
          Leer insignia
        </button>
      </form>

      <ListaCredencialesPerfil
        usuario={perfil.usuario}
        credenciales={credenciales}
        error={errorCredenciales ? "No se pudieron leer tus credenciales." : null}
      />
    </div>
  );
}
