"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function slugUsuario(valor: string) {
  return valor
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function guardarPerfil(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/perfil?error=config");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const nombre = String(formData.get("nombre") ?? "").trim();
  const usuario = slugUsuario(String(formData.get("usuario") ?? ""));
  const foto_url = String(formData.get("foto_url") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();

  if (!usuario) {
    redirect("/perfil?error=usuario");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      nombre: nombre || null,
      usuario,
      foto_url: foto_url || null,
      descripcion: descripcion || null,
    })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      redirect("/perfil?error=tomado");
    }
    redirect(`/perfil?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/perfil");
  revalidatePath(`/u/${usuario}`);
  redirect("/perfil?ok=1");
}
