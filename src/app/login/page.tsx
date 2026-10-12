import Link from "next/link";
import { Aviso } from "@/components/Aviso";
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

const CAMPO =
  "h-11 rounded-xl border border-line bg-background/70 px-3 text-base text-foreground outline-none placeholder:text-muted/70 focus:border-seal";

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = textoError(params.error);
  const listo = params.ok === "revisar";
  const configurado = isSupabaseConfigured();

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-12">
      <main className="flex w-full max-w-md flex-col gap-6 rounded-[1.75rem] border border-line bg-surface/90 px-6 py-8 shadow-[0_24px_80px_-40px_rgba(212,164,90,0.4)]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-seal">Kredian</p>
          <h1 className="font-display mt-2 text-4xl text-ink">Entrar</h1>
          <p className="mt-3 text-muted">
            Correo y contraseña. Google queda para si sobra tiempo.
          </p>
          <Link href="/" className="mt-3 inline-block text-sm font-medium text-ink underline underline-offset-4">
            Volver al inicio
          </Link>
        </div>

        {!configurado ? (
          <Aviso tono="aviso">
            Este entorno todavía no tiene Supabase. En tu PC: copiá `.env.example`
            a `.env.local`, pegá URL y anon key, y corré `supabase/schema.sql` en
            el SQL Editor.
          </Aviso>
        ) : null}

        {error ? <Aviso tono="error">{error}</Aviso> : null}

        {listo ? (
          <Aviso tono="ok">
            Cuenta creada. Si Supabase pide confirmar correo, abrí el mail y
            después volvé a entrar. Para el MVP conviene desactivar “Confirm
            email” en Authentication → Providers → Email.
          </Aviso>
        ) : null}

        <form className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            Correo
            <input
              name="correo"
              type="email"
              required
              autoComplete="email"
              className={CAMPO}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            Contraseña
            <input
              name="clave"
              type="password"
              required
              minLength={6}
              autoComplete="current-password"
              className={CAMPO}
            />
          </label>
          <button
            formAction={iniciarSesion}
            disabled={!configurado}
            className="h-12 rounded-full bg-seal text-base font-semibold text-[#1a1408] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Entrar
          </button>
          <button
            formAction={crearCuenta}
            disabled={!configurado}
            className="h-12 rounded-full border border-line bg-transparent text-base font-medium text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            Crear cuenta
          </button>
        </form>
      </main>
    </div>
  );
}
