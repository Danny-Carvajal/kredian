import { calcularHashSello, getContractWithSigner, getContractReadOnly, DatosCredencialParaSello } from "../src/lib/blockchain";
import * as fs from "fs";
import * as path from "path";

// Cargar .env.local manualmente para el script
const envContent = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf-8");
envContent.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=");
  if (k && v) process.env[k.trim()] = v.join("=").trim();
});

async function main() {
  console.log("=== INICIANDO PRUEBA DE SELLO EN SEPOLIA ===");
  console.log("Contrato:", process.env.KREDIAN_CONTRACT_ADDRESS);

  const credencialEjemplo: DatosCredencialParaSello = {
    fuente: "credly",
    badge_id: "test-badge-daniel-123",
    titulo: "AWS Educate Introduction to Cloud 101",
    emisor: "Amazon Web Services",
    fecha_emision: "2026-10-08",
    estado: "vigente",
    verificado_en: new Date().toISOString(),
  };

  const hash = calcularHashSello(credencialEjemplo);
  console.log("Hash SHA-256 calculado:", hash);

  console.log("\n1. Conectando al contrato con la llave privada...");
  const contract = getContractWithSigner();

  console.log("2. Enviando transacción 'sellar' a Sepolia...");
  const tx = await contract.sellar(hash);
  console.log("Transacción enviada! Hash de TX:", tx.hash);
  console.log("Esperando confirmación en la blockchain...");
  
  const receipt = await tx.wait();
  console.log("✅ Confirmado en bloque número:", receipt.blockNumber);
  console.log("Link en Etherscan: https://sepolia.etherscan.io/tx/" + receipt.hash);

  console.log("\n3. Comprobando lectura pública en el contrato...");
  const readContract = getContractReadOnly();
  const timestamp = await readContract.selladoEn(hash);
  console.log("Timestamp guardado en Sepolia:", Number(timestamp));
  console.log("Fecha verificada:", new Date(Number(timestamp) * 1000).toISOString());
  console.log("\n🎉 ¡TODO EL FLUJO WEB3 FUNCIONA AL 100%!");
}

main().catch(console.error);
