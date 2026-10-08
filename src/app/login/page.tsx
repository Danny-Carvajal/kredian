import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { crearCuenta, iniciarSesion } from "./actions";

type Props = {
  searchParams: Promise<{ error?: string; ok?: string }>;
};

function textoError(codigo: string | undefined) {
  if (!codigo) return null;
  if (codigo === "config") {
    return "Faltan las keys de Supabase en .env.local. Mirá supabase/schema.sql y el README.";
  }
  if (codigo === "faltan") return "Escribí correo y contraseña.";
  if (codigo === "clave") return "La contraseña tiene que tener al menos 6 caracteres.";
  return codigo;
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = textoError(params.error);
  const listo = params.ok === "revisar";
  const configurado = isSupabaseConfigured();

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-16">
      <main className="flex w-full max-w-md flex-col gap-8">
        <div className="text-center">
          <p className="text-sm font-medium tracking-wide uppercase text-zinc-500">
            Kredian
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Entrar</h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Correo y contraseña. Google queda para si sobra tiempo.
          </p>
          <Link href="/" className="mt-2 inline-block text-sm underline">
            Volver al inicio
          </Link>
        </div>

        {!configurado ? (
          <p className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
            Este entorno todavía no tiene Supabase. En tu PC: copiá `.env.example`
            a `.env.local`, pegá URL y anon key, y corré `supabase/schema.sql` en
            el SQL Editor.
          </p>
        ) : null}

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
            {error}
          </p>
        ) : null}

        {listo ? (
          <p className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-700">
            Cuenta creada. Si Supabase pide confirmar correo, abrí el mail y
            después volvé a entrar. Para el MVP conviene desactivar “Confirm
            email” en Authentication → Providers → Email.
          </p>
        ) : null}

        <form className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Correo
            <input
              name="correo"
              type="email"
              required
              autoComplete="email"
              className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Contraseña
            <input
              name="clave"
              type="password"
              required
              minLength={6}
              autoComplete="current-password"
              className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </label>
          <button
            formAction={iniciarSesion}
            disabled={!configurado}
            className="h-12 rounded-full bg-foreground text-base font-medium text-background disabled:opacity-50"
          >
            Entrar
          </button>
          <button
            formAction={crearCuenta}
            disabled={!configurado}
            className="h-12 rounded-full border border-zinc-300 text-base font-medium dark:border-zinc-700 disabled:opacity-50"
          >
            Crear cuenta
          </button>
        </form>
      </main>
    </div>
  );
}
