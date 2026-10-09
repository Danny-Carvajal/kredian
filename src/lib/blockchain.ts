import { ethers, sha256, toUtf8Bytes } from "ethers";

// ABI mínimo del contrato KredianSellos
export const KREDIAN_ABI = [
  "function sellar(bytes32 hash) external",
  "function selladoEn(bytes32 hash) external view returns (uint256)",
  "event Sellado(bytes32 indexed hash, uint256 fecha)",
];

export interface DatosCredencialParaSello {
  fuente: string;
  badge_id: string;
  titulo: string;
  emisor: string;
  fecha_emision: string; // Formato YYYY-MM-DD
  estado: string;        // ej. "vigente"
  verificado_en: string; // ISO timestamp
}

/**
 * Calcula el hash SHA-256 canónico del objeto según la Sección 7 de PROYECTO.md.
 * Las claves van en el orden EXACTO:
 * 1. fuente
 * 2. badge_id
 * 3. titulo
 * 4. emisor
 * 5. fecha_emision
 * 6. estado
 * 7. verificado_en
 *
 * ¡Sin datos personales!
 */
export function calcularHashSello(datos: DatosCredencialParaSello): string {
  const objetoOrdenado = {
    fuente: datos.fuente,
    badge_id: datos.badge_id,
    titulo: datos.titulo,
    emisor: datos.emisor,
    fecha_emision: datos.fecha_emision,
    estado: datos.estado,
    verificado_en: datos.verificado_en,
  };

  const jsonString = JSON.stringify(objetoOrdenado);
  // Retorna hash bytes32 hex (0x...)
  return sha256(toUtf8Bytes(jsonString));
}

/**
 * Obtiene el proveedor de Sepolia (para lecturas públicas)
 */
export function getSepoliaProvider() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
  return new ethers.JsonRpcProvider(rpcUrl);
}

/**
 * Obtiene la instancia del contrato para lectura
 */
export function getContractReadOnly() {
  const contractAddress = process.env.KREDIAN_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("KREDIAN_CONTRACT_ADDRESS no está configurada en las variables de entorno");
  }
  const provider = getSepoliaProvider();
  return new ethers.Contract(contractAddress, KREDIAN_ABI, provider);
}

/**
 * Obtiene la instancia del contrato con firma de billetera (solo en el servidor)
 */
export function getContractWithSigner() {
  const contractAddress = process.env.KREDIAN_CONTRACT_ADDRESS;
  const privateKey = process.env.SEPOLIA_PRIVATE_KEY;

  if (!contractAddress) {
    throw new Error("KREDIAN_CONTRACT_ADDRESS no está configurada");
  }
  if (!privateKey) {
    throw new Error("SEPOLIA_PRIVATE_KEY no está configurada");
  }

  const provider = getSepoliaProvider();
  const wallet = new ethers.Wallet(privateKey, provider);
  return new ethers.Contract(contractAddress, KREDIAN_ABI, wallet);
}
