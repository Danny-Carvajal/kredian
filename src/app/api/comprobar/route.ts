import { NextRequest, NextResponse } from "next/server";
import {
  calcularHashSello,
  ErrorDatosSello,
  esHashValido,
  getDireccionContrato,
  leerSelladoEn,
  mensajeDeError,
  urlEtherscanContrato,
  validarDatosSello,
} from "@/lib/blockchain";

export const runtime = "nodejs";

/**
 * POST /api/comprobar  (pública, solo lectura; no gasta gas)
 *
 * Body (cualquiera de estas formas):
 *  - Datos de la credencial: { fuente, badge_id, titulo, emisor, fecha_emision, estado, verificado_en }
 *    → se RECALCULA el hash (sección 7 de PROYECTO.md). Es la forma recomendada.
 *  - Datos + { hash }: además confirma que el hash guardado coincide con el recalculado
 *    (detecta si alguien editó la credencial en la base de datos después de sellarla).
 *  - Solo { hash }: comprueba que ese hash exista en el contrato.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    const json = await req.json();
    if (!json || typeof json !== "object") throw new Error();
    body = json as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "El cuerpo debe ser un objeto JSON válido" }, { status: 400 });
  }

  try {
    const hashGuardado = body.hash;
    if (hashGuardado !== undefined && !esHashValido(hashGuardado)) {
      return NextResponse.json(
        { error: "hash debe ser un bytes32 en hex (0x + 64 caracteres)" },
        { status: 400 },
      );
    }

    const tieneDatos = body.badge_id !== undefined || body.titulo !== undefined;
    let hash: string;

    if (tieneDatos) {
      hash = calcularHashSello(validarDatosSello(body));
      if (hashGuardado && hashGuardado.toLowerCase() !== hash.toLowerCase()) {
        return NextResponse.json({
          verificado: false,
          hash,
          hash_guardado: hashGuardado,
          mensaje: "Los datos de la credencial no coinciden con el sello: fueron modificados.",
        });
      }
    } else if (hashGuardado) {
      hash = hashGuardado;
    } else {
      return NextResponse.json(
        { error: "Debe enviar los datos completos de la credencial o el 'hash' para comprobar" },
        { status: 400 },
      );
    }

    const direccion = getDireccionContrato();
    const timestamp = await leerSelladoEn(hash);

    if (timestamp === 0) {
      return NextResponse.json({
        verificado: false,
        hash,
        mensaje: "El sello no existe en la blockchain o los datos fueron alterados.",
        etherscan_contract_url: urlEtherscanContrato(direccion),
      });
    }

    return NextResponse.json({
      verificado: true,
      hash,
      recalculado: tieneDatos,
      sellado_en_timestamp: timestamp,
      sellado_en_fecha: new Date(timestamp * 1000).toISOString(),
      mensaje: tieneDatos
        ? "Sello verificado. La credencial existe en Sepolia y no ha sido alterada."
        : "Sello verificado. El hash existe en Sepolia.",
      etherscan_contract_url: urlEtherscanContrato(direccion),
    });
  } catch (error) {
    if (error instanceof ErrorDatosSello) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error al comprobar sello:", error);
    return NextResponse.json(
      { error: mensajeDeError(error, "Error al consultar la blockchain") },
      { status: 500 },
    );
  }
}
