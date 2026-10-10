import { NextRequest, NextResponse } from "next/server";
import { ErrorDatosSello, mensajeDeError, sellarCredencial } from "@/lib/blockchain";
import {
  ErrorSolicitudSello,
  type FilaCredencial,
  procesarSolicitudSello,
} from "@/lib/sellar-solicitud";
import { createClient } from "@/lib/supabase/server";

// ethers necesita el runtime de Node (no Edge). La confirmación en Sepolia tarda ~12–30 s,
// así que subimos el límite de tiempo para Vercel.
export const runtime = "nodejs";
export const maxDuration = 60;

function textoONull(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const limpio = valor.trim();
  return limpio === "" ? null : valor;
}

/**
 * POST /api/sellar
 * Body: { credencial_id }
 *
 * Exige la sesión de Supabase. Lee la fila de `credenciales` (tiene que ser del
 * usuario) y sella ESOS datos. La firma sigue solo en el servidor.
 *
 * Después guarda `hash`, `tx_hash` y `sellado_en`.
 * `sellado_en` queda igual al `verificado_en` del hash (sección 7), no al
 * timestamp del bloque, para que /api/comprobar recalcule el mismo sha256.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "El cuerpo debe ser JSON válido" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const cuerpo = await procesarSolicitudSello({
      userId: user?.id ?? null,
      body,
      obtenerCredencial: async (id) => {
        const { data, error } = await supabase
          .from("credenciales")
          .select(
            "id, user_id, fuente, badge_id, titulo, emisor, fecha_emision, estado, hash, tx_hash, sellado_en",
          )
          .eq("id", id)
          .maybeSingle();

        if (error) {
          throw new Error(error.message);
        }
        if (!data) return null;

        const fila = data as Record<string, unknown>;
        const credencial: FilaCredencial = {
          id: String(fila.id),
          user_id: String(fila.user_id),
          fuente: textoONull(fila.fuente),
          badge_id: textoONull(fila.badge_id),
          titulo: textoONull(fila.titulo),
          emisor: textoONull(fila.emisor),
          fecha_emision: textoONull(fila.fecha_emision),
          estado: textoONull(fila.estado),
          hash: textoONull(fila.hash),
          tx_hash: textoONull(fila.tx_hash),
          sellado_en: textoONull(fila.sellado_en),
        };
        return credencial;
      },
      reservarSelladoEn: async (id, userId, selladoEn) => {
        // Solo si sellado_en sigue null: así dos clicks no fijan dos timestamps.
        const { data, error } = await supabase
          .from("credenciales")
          .update({ sellado_en: selladoEn })
          .eq("id", id)
          .eq("user_id", userId)
          .is("sellado_en", null)
          .select("id")
          .maybeSingle();

        if (error) {
          throw new Error(error.message);
        }
        return data ? "ok" : "ya_reservado";
      },
      guardarSello: async (id, userId, campos) => {
        const { data, error } = await supabase
          .from("credenciales")
          .update({
            hash: campos.hash,
            tx_hash: campos.tx_hash,
            // Mismo string que verificado_en del hash. No usar el timestamp del bloque.
            sellado_en: campos.sellado_en,
          })
          .eq("id", id)
          .eq("user_id", userId)
          .select("id")
          .maybeSingle();

        if (error) {
          throw new Error(error.message);
        }
        if (!data) {
          throw new Error("No se pudo guardar el sello en la credencial");
        }
      },
      sellar: sellarCredencial,
    });

    return NextResponse.json(cuerpo);
  } catch (error) {
    if (error instanceof ErrorSolicitudSello) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof ErrorDatosSello) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error al sellar en blockchain:", error);
    return NextResponse.json(
      { error: mensajeDeError(error, "Error al procesar el sello en blockchain") },
      { status: 500 },
    );
  }
}
