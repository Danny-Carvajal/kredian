import { NextRequest, NextResponse } from "next/server";
import { calcularHashSello, getContractWithSigner, DatosCredencialParaSello } from "@/lib/blockchain";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { fuente, badge_id, titulo, emisor, fecha_emision, estado, verificado_en } = body;

    if (!fuente || !badge_id || !titulo || !emisor || !fecha_emision || !estado || !verificado_en) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios para generar el sello" },
        { status: 400 }
      );
    }

    const datosCredencial: DatosCredencialParaSello = {
      fuente,
      badge_id,
      titulo,
      emisor,
      fecha_emision,
      estado,
      verificado_en,
    };

    // 1. Calcular hash canónico (sha256)
    const hash = calcularHashSello(datosCredencial);

    // 2. Conectar al contrato en Sepolia con la llave privada
    const contract = getContractWithSigner();

    // 3. Verificar si ya fue sellado previamente para evitar revert innecesario
    const yaSellado = await contract.selladoEn(hash);
    if (yaSellado > BigInt(0)) {
      return NextResponse.json({
        mensaje: "Esta credencial ya estaba sellada en la blockchain",
        hash,
        sellado_en: Number(yaSellado),
        ya_existia: true,
      });
    }

    // 4. Enviar transacción al contrato
    const tx = await contract.sellar(hash);
    const receipt = await tx.wait(); // Esperar confirmación en Sepolia

    return NextResponse.json({
      mensaje: "Credencial sellada exitosamente en Sepolia",
      hash,
      tx_hash: receipt.hash,
      block_number: receipt.blockNumber,
      etherscan_url: `https://sepolia.etherscan.io/tx/${receipt.hash}`,
    });
  } catch (error: any) {
    console.error("Error al sellar en blockchain:", error);
    return NextResponse.json(
      { error: error?.reason || error?.message || "Error al procesar el sello en blockchain" },
      { status: 500 }
    );
  }
}
