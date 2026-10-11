import { NextRequest, NextResponse } from "next/server";
import { leerInsigniaCredly } from "@/lib/credly";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Falta configurar Supabase." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Tenés que entrar para leer una insignia." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "El cuerpo debe ser JSON." }, { status: 400 });
  }

  const url =
    body && typeof body === "object" && "url" in body ? String((body as { url?: unknown }).url ?? "") : "";

  try {
    const insignia = await leerInsigniaCredly(url);
    return NextResponse.json(insignia);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "No se pudo leer Credly.";
    return NextResponse.json({ error: mensaje }, { status: 400 });
  }
}
