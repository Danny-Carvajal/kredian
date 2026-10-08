"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { asegurarPerfil } from "@/lib/profiles";

function mensajeAuth(error: string) {
  if (error.includes("Invalid login credentials")) {
    return "Correo o contraseña incorrectos.";
  }
  if (error.includes("User already registered")) {
    return "Ese correo ya tiene cuenta. Entrá con tu contraseña.";
  }
  if (error.toLowerCase().includes("email")) {
    return error;
  }
  return error;
}

export async function iniciarSesion(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/login?error=config");
  }

  const correo = String(formData.get("correo") ?? "").trim();
  const clave = String(formData.get("clave") ?? "");

  if (!correo || !clave) {
    redirect("/login?error=faltan");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: clave,
  });

  if (error || !data.user) {
    redirect(`/login?error=${encodeURIComponent(mensajeAuth(error?.message ?? "No se pudo entrar"))}`);
  }

  await asegurarPerfil(supabase, data.user);
  redirect("/perfil");
}

export async function crearCuenta(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/login?error=config");
  }

  const correo = String(formData.get("correo") ?? "").trim();
  const clave = String(formData.get("clave") ?? "");

  if (!correo || !clave) {
    redirect("/login?error=faltan");
  }

  if (clave.length < 6) {
    redirect("/login?error=clave");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: correo,
    password: clave,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(mensajeAuth(error.message))}`);
  }

  if (!data.session || !data.user) {
    redirect("/login?ok=revisar");
  }

  await asegurarPerfil(supabase, data.user);
  redirect("/perfil");
}

export async function cerrarSesion() {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
