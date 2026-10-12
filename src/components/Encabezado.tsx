import Link from "next/link";
import { Marca } from "@/components/Marca";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function Encabezado() {
  let sesion = false;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      sesion = Boolean(user);
    } catch {
      sesion = false;
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Marca />
        <Link
          href={sesion ? "/perfil" : "/login"}
          className="inline-flex h-10 items-center justify-center rounded-full bg-seal px-5 text-sm font-semibold text-[#06210f] transition hover:brightness-110"
        >
          {sesion ? "Perfil" : "Entrar"}
        </Link>
      </div>
    </header>
  );
}
