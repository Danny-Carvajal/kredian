"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { leerInsigniaCredly } from "@/lib/credly";
import { nombresCoinciden } from "@/lib/nombres";
import { asignarRango } from "@/lib/rangos";
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

export async function pegarCredly(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/perfil?error=config");
  }

  const url = String(formData.get("credly_url") ?? "").trim();
  if (!url) {
    redirect("/perfil?error=link");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: perfil } = await supabase
    .from("profiles")
    .select("nombre, usuario")
    .eq("id", user.id)
    .maybeSingle();

  let insignia;
  try {
    insignia = await leerInsigniaCredly(url);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "No se pudo leer Credly.";
    redirect(`/perfil?error=${encodeURIComponent(mensaje)}`);
  }

  const coincide = nombresCoinciden(perfil?.nombre ?? "", insignia.nombre_en_insignia);
  const rango = asignarRango(insignia.titulo);

  const { data: existente } = await supabase
    .from("credenciales")
    .select("id")
    .eq("user_id", user.id)
    .eq("badge_id", insignia.badge_id)
    .maybeSingle();

  const fila = {
    user_id: user.id,
    fuente: "credly",
    url: insignia.url,
    badge_id: insignia.badge_id,
    titulo: insignia.titulo,
    emisor: insignia.emisor,
    nombre_en_insignia: insignia.nombre_en_insignia,
    fecha_emision: insignia.fecha_emision,
    fecha_vencimiento: insignia.fecha_vencimiento,
    estado: insignia.estado,
    nombre_coincide: coincide,
    rango,
  };

  if (existente?.id) {
    const { error } = await supabase.from("credenciales").update(fila).eq("id", existente.id);
    if (error) {
      redirect(`/perfil?error=${encodeURIComponent(error.message)}`);
    }
  } else {
    const { error } = await supabase.from("credenciales").insert(fila);
    if (error) {
      redirect(`/perfil?error=${encodeURIComponent(error.message)}`);
    }
  }

  revalidatePath("/perfil");
  if (perfil?.usuario) {
    revalidatePath(`/u/${perfil.usuario}`);
  }

  if (!coincide) {
    redirect("/perfil?error=nombre");
  }
  if (insignia.plan_b) {
    redirect("/perfil?ok=planb");
  }
  redirect("/perfil?ok=credly");
}
