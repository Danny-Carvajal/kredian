import { NextRequest, NextResponse } from "next/server";
import { ErrorDatosSello, mensajeDeError, sellarCredencial } from "@/lib/blockchain";

// ethers necesita el runtime de Node (no Edge). La confirmación en Sepolia tarda ~12–30 s,
// así que subimos el límite de tiempo para Vercel.
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/sellar
 * Body: { fuente, badge_id, titulo, emisor, fecha_emision, estado, verificado_en }
 * Responde: { hash, tx_hash, block_number, sellado_en_blockchain, etherscan_url, ya_existia, confirmado, verificado_en }
 *
 * La firma se hace SOLO aquí, en el servidor, con SEPOLIA_PRIVATE_KEY de .env.local.
 * Guardar en `credenciales`: hash, tx_hash y `verificado_en` EXACTO que devuelve esta ruta
 * (sin él no se puede recalcular el hash para "Comprobar sello").
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "El cuerpo debe ser JSON válido" }, { status: 400 });
  }

  try {
    const r = await sellarCredencial(body);

    return NextResponse.json({
      mensaje: r.ya_existia
        ? "Esta credencial ya estaba sellada en la blockchain"
        : r.confirmado
          ? "Credencial sellada exitosamente en Sepolia"
          : "Sello enviado a Sepolia; la confirmación está tardando",
      hash: r.hash,
      tx_hash: r.tx_hash,
      block_number: r.block_number,
      sellado_en_blockchain: r.sellado_en_blockchain,
      etherscan_url: r.etherscan_url,
      ya_existia: r.ya_existia,
      confirmado: r.confirmado,
      verificado_en: r.datos.verificado_en,
    });
  } catch (error) {
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
