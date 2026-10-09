import { NextRequest, NextResponse } from "next/server";
import { calcularHashSello, getContractReadOnly, DatosCredencialParaSello } from "@/lib/blockchain";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Puede recibir el hash directo o los datos de la credencial para recalcular
    let hash = body.hash;

    if (!hash) {
      const { fuente, badge_id, titulo, emisor, fecha_emision, estado, verificado_en } = body;
      if (!fuente || !badge_id || !titulo || !emisor || !fecha_emision || !estado || !verificado_en) {
        return NextResponse.json(
          { error: "Debe proveer el 'hash' o los datos completos de la credencial para comprobar" },
          { status: 400 }
        );
      }
      const datos: DatosCredencialParaSello = {
        fuente,
        badge_id,
        titulo,
        emisor,
        fecha_emision,
        estado,
        verificado_en,
      };
      hash = calcularHashSello(datos);
    }

    // Consultar el contrato en Sepolia (solo lectura pública)
    const contract = getContractReadOnly();
    const timestampBigInt = await contract.selladoEn(hash);
    const timestamp = Number(timestampBigInt);

    if (timestamp === 0) {
      return NextResponse.json({
        verificado: false,
        hash,
        mensaje: "El sello no existe en la blockchain o los datos fueron alterados.",
      });
    }

    const fechaSellado = new Date(timestamp * 1000).toISOString();

    return NextResponse.json({
      verificado: true,
      hash,
      sellado_en_timestamp: timestamp,
      sellado_en_fecha: fechaSellado,
      mensaje: "Sello verificado. La credencial existe y no ha sido alterada.",
      etherscan_contract_url: `https://sepolia.etherscan.io/address/${process.env.KREDIAN_CONTRACT_ADDRESS}`,
    });
  } catch (error: any) {
    console.error("Error al comprobar sello:", error);
    return NextResponse.json(
      { error: error?.reason || error?.message || "Error al consultar la blockchain" },
      { status: 500 }
    );
  }
}
