import type { User } from "@supabase/supabase-js";
import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export type Profile = {
  id: string;
  nombre: string | null;
  usuario: string;
  foto_url: string | null;
  descripcion: string | null;
  creado_en: string;
};

function usuarioDesdeEmail(email: string) {
  const base =
    email
      .split("@")[0]
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "user";

  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function asegurarPerfil(
  supabase: Supabase,
  user: User,
): Promise<Profile> {
  const { data: existente, error: readError } = await supabase
    .from("profiles")
    .select("id, nombre, usuario, foto_url, descripcion, creado_en")
    .eq("id", user.id)
    .maybeSingle();

  if (readError) {
    throw new Error(readError.message);
  }

  if (existente) {
    return existente;
  }

  const insert = {
    id: user.id,
    nombre: (user.user_metadata?.nombre as string | undefined) ?? null,
    usuario: usuarioDesdeEmail(user.email ?? user.id),
    foto_url: null,
    descripcion: null,
  };

  const { data: creado, error: insertError } = await supabase
    .from("profiles")
    .insert(insert)
    .select("id, nombre, usuario, foto_url, descripcion, creado_en")
    .single();

  if (insertError || !creado) {
    throw new Error(insertError?.message ?? "No se pudo crear el perfil");
  }

  return creado;
}
