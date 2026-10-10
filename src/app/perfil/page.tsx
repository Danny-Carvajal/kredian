import Link from "next/link";
import { redirect } from "next/navigation";
import { cerrarSesion } from "@/app/login/actions";
import { Aviso } from "@/components/Aviso";
import { asegurarPerfil } from "@/lib/profiles";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { guardarPerfil } from "./actions";

type Props = {
  searchParams: Promise<{ error?: string; ok?: string }>;
};

function textoError(codigo: string | undefined) {
  if (!codigo) return null;
  if (codigo === "config") return "Faltan las keys de Supabase.";
  if (codigo === "usuario") return "El usuario de la URL no puede estar vacío.";
  if (codigo === "tomado") return "Ese usuario ya está en uso. Probá otro.";
  return codigo;
}

const CAMPO =
  "h-11 rounded-xl border border-line bg-surface px-3 text-base text-foreground outline-none focus:border-ink focus:ring-2 focus:ring-ink/20";

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

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Tu perfil</h1>
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

      {params.ok === "1" ? <Aviso tono="ok">Perfil guardado.</Aviso> : null}

      <form action={guardarPerfil} className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-5 shadow-sm">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
          Nombre
          <input
            name="nombre"
            defaultValue={perfil.nombre ?? ""}
            className={CAMPO}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
          Usuario (va en /u/tu-usuario)
          <input
            name="usuario"
            required
            defaultValue={perfil.usuario}
            className={CAMPO}
          />
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
            className="rounded-xl border border-line bg-surface px-3 py-2 text-base text-foreground outline-none focus:border-ink focus:ring-2 focus:ring-ink/20"
          />
        </label>
        <button
          type="submit"
          className="h-12 rounded-full bg-ink text-base font-medium text-white transition-opacity hover:opacity-90"
        >
          Guardar
        </button>
      </form>

      <section className="rounded-2xl border border-dashed border-line bg-surface px-4 py-6">
        <h2 className="font-medium text-ink">Pegar link de Credly</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Mañana: acá va el campo para leer la insignia, validar el nombre y
          sellar. Hoy solo el perfil.
        </p>
      </section>
    </div>
  );
}
