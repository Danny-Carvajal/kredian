/**
 * Prueba del sello en Sepolia (Plan, sábado 10: "probar el sello 3 veces seguidas sin fallos").
 *
 * Uso:   npm run probar:sello          (3 sellos seguidos)
 *        npm run probar:sello -- 1     (cantidad personalizada)
 *
 * Necesita .env.local con SEPOLIA_RPC_URL, SEPOLIA_PRIVATE_KEY y KREDIAN_CONTRACT_ADDRESS.
 * Gasta un poco de ETH de prueba de Sepolia (sin valor real).
 */
import * as fs from "node:fs";
import * as path from "node:path";

const rutaEnv = path.resolve(process.cwd(), ".env.local");
if (!fs.existsSync(rutaEnv)) {
  console.error("❌ No existe .env.local. Copiá .env.example y completá las llaves.");
  process.exit(1);
}
process.loadEnvFile(rutaEnv);

async function main() {
  // Import dinámico: así las variables de .env.local ya están cargadas.
  const {
    calcularHashSello,
    leerSelladoEn,
    sellarCredencial,
    getDireccionContrato,
    getSepoliaProvider,
  } = await import("../src/lib/blockchain");
  const { ethers } = await import("ethers");

  const cantidad = Math.max(1, Number(process.argv[2]) || 3);
  const direccion = getDireccionContrato();
  const provider = getSepoliaProvider();
  const firmante = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY!.trim());
  const saldo = await provider.getBalance(firmante.address);

  console.log("=== PRUEBA DE SELLO EN SEPOLIA ===");
  console.log("Contrato:", direccion);
  console.log("Wallet:  ", firmante.address, `(${ethers.formatEther(saldo)} ETH de prueba)`);
  console.log(`Sellos a probar: ${cantidad}\n`);

  let fallos = 0;
  for (let i = 1; i <= cantidad; i++) {
    const credencial = {
      fuente: "credly",
      badge_id: `prueba-kredian-${Date.now()}-${i}`,
      titulo: "AWS Educate Introduction to Cloud 101",
      emisor: "Amazon Web Services",
      fecha_emision: "2026-10-08",
      estado: "vigente",
      verificado_en: new Date().toISOString(),
    };

    try {
      const inicio = Date.now();
      const r = await sellarCredencial(credencial);
      const segundos = ((Date.now() - inicio) / 1000).toFixed(1);

      // Comprobación: recalcular con los datos "guardados" y leer el contrato.
      const recalculado = calcularHashSello({ ...credencial, verificado_en: r.datos.verificado_en });
      const ts = await leerSelladoEn(recalculado);
      const ok = r.confirmado && recalculado === r.hash && ts > 0;

      console.log(`${ok ? "✅" : "❌"} Sello ${i}/${cantidad} (${segundos}s)`);
      console.log("   hash:   ", r.hash);
      console.log("   bloque: ", r.block_number, "| sellado:", r.sellado_en_blockchain);
      console.log("   tx:     ", r.etherscan_url);
      if (!ok) fallos++;
    } catch (error) {
      fallos++;
      console.error(`❌ Sello ${i}/${cantidad} falló:`, (error as Error).message);
    }
  }

  console.log(
    fallos === 0
      ? `\n🎉 ${cantidad}/${cantidad} sellos seguidos sin fallos.`
      : `\n⚠️  ${fallos} de ${cantidad} sellos fallaron.`,
  );
  process.exit(fallos === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error("❌ Error inesperado:", error);
  process.exit(1);
});
