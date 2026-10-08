import Link from "next/link";
import { redirect } from "next/navigation";
import { cerrarSesion } from "@/app/login/actions";
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

export default async function PerfilPage({ searchParams }: Props) {
  const params = await searchParams;

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-6 py-16">
        <h1 className="text-3xl font-semibold">Tu perfil</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Configurá Supabase en `.env.local` y corré `supabase/schema.sql` para
          poder editar el perfil.
        </p>
        <Link href="/login" className="underline">
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
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Tu perfil</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Este nombre se va a comparar con el de la insignia de Credly.
          </p>
        </div>
        <form action={cerrarSesion}>
          <button type="submit" className="text-sm underline">
            Salir
          </button>
        </form>
      </header>

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {params.ok === "1" ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Perfil guardado.
        </p>
      ) : null}

      <form action={guardarPerfil} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Nombre
          <input
            name="nombre"
            defaultValue={perfil.nombre ?? ""}
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Usuario (va en /u/tu-usuario)
          <input
            name="usuario"
            required
            defaultValue={perfil.usuario}
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Foto (URL)
          <input
            name="foto_url"
            type="url"
            defaultValue={perfil.foto_url ?? ""}
            placeholder="https://..."
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Descripción
          <textarea
            name="descripcion"
            rows={4}
            defaultValue={perfil.descripcion ?? ""}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </label>
        <button
          type="submit"
          className="h-12 rounded-full bg-foreground text-base font-medium text-background"
        >
          Guardar
        </button>
      </form>

      <section className="rounded-2xl border border-dashed border-zinc-300 px-4 py-6 dark:border-zinc-700">
        <h2 className="font-medium">Pegar link de Credly</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Mañana: acá va el campo para leer la insignia, validar el nombre y
          sellar. Hoy solo el perfil.
        </p>
      </section>
    </div>
  );
}
