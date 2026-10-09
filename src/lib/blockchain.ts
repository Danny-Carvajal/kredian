import { ethers, sha256, toUtf8Bytes } from "ethers";

// Red Sepolia (chainId oficial). Se fija para no hacer llamadas extra al RPC
// y para fallar rápido si alguien pone una URL de otra red.
export const SEPOLIA_CHAIN_ID = 11155111;
export const ETHERSCAN_BASE_URL = "https://sepolia.etherscan.io";

// RPC público de respaldo (solo lectura). Para producción usar Alchemy/Infura en SEPOLIA_RPC_URL.
const RPC_PUBLICO_RESPALDO = "https://ethereum-sepolia-rpc.publicnode.com";

// ABI mínimo del contrato KredianSellos (sección 7 de PROYECTO.md)
export const KREDIAN_ABI = [
  "function sellar(bytes32 hash) external",
  "function selladoEn(bytes32 hash) external view returns (uint256)",
  "event Sellado(bytes32 indexed hash, uint256 fecha)",
];

export const ESTADOS_VALIDOS = ["vigente", "vencida", "revocada"] as const;
export type EstadoCredencial = (typeof ESTADOS_VALIDOS)[number];

export interface DatosCredencialParaSello {
  fuente: string;
  badge_id: string;
  titulo: string;
  emisor: string;
  fecha_emision: string; // Formato YYYY-MM-DD
  estado: string; // vigente | vencida | revocada
  verificado_en: string; // ISO timestamp
}

/** Error de datos de entrada (se responde 400, no 500). */
export class ErrorDatosSello extends Error {}

const CLAVES_SELLO = [
  "fuente",
  "badge_id",
  "titulo",
  "emisor",
  "fecha_emision",
  "estado",
  "verificado_en",
] as const;

/**
 * Normaliza la fecha de emisión a "YYYY-MM-DD".
 * Supabase devuelve las columnas `date` así, pero aceptamos también un ISO completo
 * (ej. "2026-10-08T00:00:00Z") y nos quedamos con la parte de la fecha.
 */
function normalizarFechaEmision(valor: string): string {
  const fecha = valor.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || Number.isNaN(Date.parse(fecha))) {
    throw new ErrorDatosSello("fecha_emision debe tener formato YYYY-MM-DD");
  }
  return fecha;
}

/**
 * Normaliza `verificado_en` a ISO UTC con milisegundos ("2026-10-08T23:12:34.567Z").
 *
 * IMPORTANTE: Supabase devuelve las columnas `timestamptz` como
 * "2026-10-08T23:12:34.567+00:00". Sin esta normalización, el hash recalculado
 * con los datos guardados NO coincidiría con el sellado y "Comprobar sello" fallaría.
 */
function normalizarVerificadoEn(valor: string): string {
  const ms = Date.parse(valor);
  if (Number.isNaN(ms)) {
    throw new ErrorDatosSello("verificado_en debe ser una fecha ISO válida");
  }
  return new Date(ms).toISOString();
}

/**
 * Valida un objeto desconocido (ej. el body de una petición) y devuelve los datos
 * del sello ya normalizados. Lanza ErrorDatosSello si algo falta o es inválido.
 */
export function validarDatosSello(entrada: unknown): DatosCredencialParaSello {
  if (!entrada || typeof entrada !== "object") {
    throw new ErrorDatosSello("Se esperaba un objeto JSON con los datos de la credencial");
  }
  const obj = entrada as Record<string, unknown>;

  for (const clave of CLAVES_SELLO) {
    const valor = obj[clave];
    if (typeof valor !== "string" || valor.trim() === "") {
      throw new ErrorDatosSello(`Falta el campo "${clave}" o no es texto`);
    }
    if (valor.length > 500) {
      throw new ErrorDatosSello(`El campo "${clave}" es demasiado largo`);
    }
  }

  if (obj.fuente !== "credly") {
    throw new ErrorDatosSello('Por ahora la única fuente permitida es "credly"');
  }
  if (!ESTADOS_VALIDOS.includes(obj.estado as EstadoCredencial)) {
    throw new ErrorDatosSello(`estado debe ser uno de: ${ESTADOS_VALIDOS.join(", ")}`);
  }

  return {
    fuente: obj.fuente as string,
    badge_id: obj.badge_id as string,
    titulo: obj.titulo as string,
    emisor: obj.emisor as string,
    fecha_emision: normalizarFechaEmision(obj.fecha_emision as string),
    estado: obj.estado as string,
    verificado_en: normalizarVerificadoEn(obj.verificado_en as string),
  };
}

/**
 * Arma el texto canónico del sello según la Sección 7 de PROYECTO.md.
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
export function textoCanonicoSello(datos: DatosCredencialParaSello): string {
  const objetoOrdenado = {
    fuente: datos.fuente,
    badge_id: datos.badge_id,
    titulo: datos.titulo,
    emisor: datos.emisor,
    fecha_emision: normalizarFechaEmision(datos.fecha_emision),
    estado: datos.estado,
    verificado_en: normalizarVerificadoEn(datos.verificado_en),
  };
  return JSON.stringify(objetoOrdenado);
}

/**
 * Calcula el hash SHA-256 canónico del sello. Devuelve un bytes32 en hex (0x + 64 caracteres),
 * listo para mandarlo a `sellar(bytes32)`.
 */
export function calcularHashSello(datos: DatosCredencialParaSello): string {
  return sha256(toUtf8Bytes(textoCanonicoSello(datos)));
}

/** true si el texto es un bytes32 en hex (0x + 64 caracteres hex). */
export function esHashValido(hash: unknown): hash is string {
  return typeof hash === "string" && /^0x[0-9a-fA-F]{64}$/.test(hash);
}

export function urlEtherscanTx(txHash: string): string {
  return `${ETHERSCAN_BASE_URL}/tx/${txHash}`;
}

export function urlEtherscanContrato(direccion: string): string {
  return `${ETHERSCAN_BASE_URL}/address/${direccion}`;
}

/** Dirección del contrato desde .env.local, validada. */
export function getDireccionContrato(): string {
  const direccion = process.env.KREDIAN_CONTRACT_ADDRESS?.trim();
  if (!direccion) {
    throw new Error("KREDIAN_CONTRACT_ADDRESS no está configurada en las variables de entorno");
  }
  if (!ethers.isAddress(direccion)) {
    throw new Error("KREDIAN_CONTRACT_ADDRESS no es una dirección válida");
  }
  return direccion;
}

/**
 * Obtiene el proveedor de Sepolia (para lecturas públicas)
 */
export function getSepoliaProvider() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL?.trim() || RPC_PUBLICO_RESPALDO;
  return new ethers.JsonRpcProvider(rpcUrl, SEPOLIA_CHAIN_ID, { staticNetwork: true });
}

/**
 * Obtiene la instancia del contrato para lectura
 */
export function getContractReadOnly() {
  return new ethers.Contract(getDireccionContrato(), KREDIAN_ABI, getSepoliaProvider());
}

/**
 * Obtiene la instancia del contrato con firma de billetera (SOLO en el servidor).
 * Nunca importar esto desde un componente "use client".
 */
export function getContractWithSigner() {
  const direccion = getDireccionContrato();
  const privateKey = process.env.SEPOLIA_PRIVATE_KEY?.trim();
  if (!privateKey) {
    throw new Error("SEPOLIA_PRIVATE_KEY no está configurada");
  }

  const wallet = new ethers.Wallet(privateKey, getSepoliaProvider());
  return new ethers.Contract(direccion, KREDIAN_ABI, wallet);
}

/** Lee en el contrato cuándo se selló un hash. Devuelve 0 si nunca se selló. */
export async function leerSelladoEn(hash: string): Promise<number> {
  const timestamp: bigint = await getContractReadOnly().selladoEn(hash);
  return Number(timestamp);
}

export interface ResultadoSello {
  hash: string;
  /** Datos normalizados que se usaron para el hash. Guardar `verificado_en` tal cual en la BD. */
  datos: DatosCredencialParaSello;
  ya_existia: boolean;
  /** Pendiente de confirmar si la red tardó más que el tiempo de espera. */
  confirmado: boolean;
  tx_hash: string | null;
  block_number: number | null;
  /** Fecha (ISO) en que quedó sellado en la blockchain, si ya se conoce. */
  sellado_en_blockchain: string | null;
  etherscan_url: string | null;
}

function esErrorYaSellado(error: unknown): boolean {
  const e = error as { reason?: string; shortMessage?: string; message?: string };
  return [e?.reason, e?.shortMessage, e?.message].some((m) => m?.includes("Ya sellado"));
}

/**
 * Flujo completo del sello: valida, calcula hash, revisa si ya existe y manda `sellar` a Sepolia.
 * Pensado para usarse desde el servidor (ruta /api/sellar o una server action de la integración).
 *
 * @param esperaMs tiempo máximo esperando la confirmación del bloque.
 */
export async function sellarCredencial(
  entrada: unknown,
  esperaMs = 45_000,
): Promise<ResultadoSello> {
  const datos = validarDatosSello(entrada);
  const hash = calcularHashSello(datos);
  const contract = getContractWithSigner();

  // Si ya estaba sellado, no gastamos gas ni provocamos un revert.
  const previo = Number(await contract.selladoEn(hash));
  if (previo > 0) {
    return {
      hash,
      datos,
      ya_existia: true,
      confirmado: true,
      tx_hash: null,
      block_number: null,
      sellado_en_blockchain: new Date(previo * 1000).toISOString(),
      etherscan_url: null,
    };
  }

  let tx: ethers.ContractTransactionResponse;
  try {
    tx = await contract.sellar(hash);
  } catch (error) {
    // Carrera: otra petición selló el mismo hash entre la lectura y el envío.
    if (esErrorYaSellado(error)) {
      const ts = await leerSelladoEn(hash);
      return {
        hash,
        datos,
        ya_existia: true,
        confirmado: true,
        tx_hash: null,
        block_number: null,
        sellado_en_blockchain: ts > 0 ? new Date(ts * 1000).toISOString() : null,
        etherscan_url: null,
      };
    }
    throw error;
  }

  try {
    const receipt = await tx.wait(1, esperaMs);
    if (!receipt || receipt.status !== 1) {
      throw new Error("La transacción de sellado falló en Sepolia");
    }
    const bloque = await receipt.getBlock();
    return {
      hash,
      datos,
      ya_existia: false,
      confirmado: true,
      tx_hash: receipt.hash,
      block_number: receipt.blockNumber,
      sellado_en_blockchain: new Date(bloque.timestamp * 1000).toISOString(),
      etherscan_url: urlEtherscanTx(receipt.hash),
    };
  } catch (error) {
    // Si solo se venció el tiempo de espera, la tx ya está en camino: devolvemos su hash.
    if ((error as { code?: string })?.code === "TIMEOUT") {
      return {
        hash,
        datos,
        ya_existia: false,
        confirmado: false,
        tx_hash: tx.hash,
        block_number: null,
        sellado_en_blockchain: null,
        etherscan_url: urlEtherscanTx(tx.hash),
      };
    }
    throw error;
  }
}

/** Mensaje de error legible a partir de un error de ethers o JS. */
export function mensajeDeError(error: unknown, porDefecto: string): string {
  const e = error as { shortMessage?: string; reason?: string; message?: string };
  return e?.reason || e?.shortMessage || e?.message || porDefecto;
}
