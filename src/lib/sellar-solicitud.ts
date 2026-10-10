import {
  calcularHashSello,
  type DatosCredencialParaSello,
  normalizarHash,
  normalizarVerificadoEn,
  type ResultadoSello,
  validarDatosSello,
} from "@/lib/blockchain";

/**
 * Errores de la solicitud de sello (sesión, dueño, body).
 * El status es el HTTP que debe responder /api/sellar.
 */
export class ErrorSolicitudSello extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ErrorSolicitudSello";
    this.status = status;
  }
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Fila de `credenciales` que usa el sello. Sin datos personales. */
export type FilaCredencial = {
  id: string;
  user_id: string;
  fuente: string | null;
  badge_id: string | null;
  titulo: string | null;
  emisor: string | null;
  fecha_emision: string | null;
  estado: string | null;
  hash: string | null;
  tx_hash: string | null;
  sellado_en: string | null;
};

/**
 * Lo que se escribe en `credenciales` después de sellar.
 *
 * `sellado_en` NO es el timestamp del bloque. Es exactamente el `verificado_en`
 * que entró al hash (sección 7, última clave). `/api/comprobar` lee esta columna
 * como alias de `verificado_en` y tiene que recalcular el mismo sha256.
 */
export type SelloGuardado = {
  hash: string;
  tx_hash: string | null;
  sellado_en: string;
};

export type CuerpoSello = {
  mensaje: string;
  credencial_id: string;
  hash: string;
  tx_hash: string | null;
  block_number: number | null;
  sellado_en_blockchain: string | null;
  etherscan_url: string | null;
  ya_existia: boolean;
  confirmado: boolean;
  verificado_en: string;
  sellado_en: string;
};

export type DependenciasSello = {
  userId: string | null;
  body: unknown;
  obtenerCredencial: (id: string) => Promise<FilaCredencial | null>;
  /**
   * Escribe `sellado_en` solo si la fila todavía no lo tiene.
   * "ya_reservado" = otra petición ya fijó el timestamp: no sellamos con otro.
   */
  reservarSelladoEn: (
    id: string,
    userId: string,
    selladoEn: string,
  ) => Promise<"ok" | "ya_reservado">;
  guardarSello: (id: string, userId: string, campos: SelloGuardado) => Promise<void>;
  sellar: (entrada: DatosCredencialParaSello) => Promise<ResultadoSello>;
  ahora?: () => Date;
};

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

export function leerCredencialId(body: unknown): string {
  if (!esObjeto(body)) {
    throw new ErrorSolicitudSello("El cuerpo debe ser un objeto JSON", 400);
  }
  const crudo = body.credencial_id;
  const id = typeof crudo === "string" ? crudo.trim() : "";
  if (!UUID_RE.test(id)) {
    throw new ErrorSolicitudSello(
      "Enviá solo credencial_id (uuid) de una credencial tuya",
      400,
    );
  }
  return id;
}

function hashesIguales(guardado: string | null, calculado: string): boolean {
  if (!guardado) return false;
  const a = normalizarHash(guardado);
  const b = normalizarHash(calculado);
  return a !== null && a === b;
}

function mensajeDeResultado(resultado: ResultadoSello): string {
  if (resultado.ya_existia) {
    return "Esta credencial ya estaba sellada en la blockchain";
  }
  if (resultado.confirmado) {
    return "Credencial sellada exitosamente en Sepolia";
  }
  return "Sello enviado a Sepolia; la confirmación está tardando";
}

function cuerpoDe(
  fila: FilaCredencial,
  verificadoEn: string,
  extra: {
    mensaje: string;
    hash: string;
    tx_hash: string | null;
    block_number: number | null;
    sellado_en_blockchain: string | null;
    etherscan_url: string | null;
    ya_existia: boolean;
    confirmado: boolean;
  },
): CuerpoSello {
  return {
    credencial_id: fila.id,
    verificado_en: verificadoEn,
    // Mismo string que se guardó (o que ya estaba) en credenciales.sellado_en.
    sellado_en: verificadoEn,
    ...extra,
  };
}

/**
 * Sella la credencial del usuario logueado y devuelve lo que hay que responder.
 *
 * El body solo aporta `credencial_id`. Título, emisor, fechas y estado salen de
 * la fila en `credenciales`: el navegador no puede inventar el sello ni elegir
 * otra credencial.
 */
export async function procesarSolicitudSello(
  deps: DependenciasSello,
): Promise<CuerpoSello> {
  if (!deps.userId) {
    throw new ErrorSolicitudSello("Tenés que entrar para sellar una credencial", 401);
  }

  const credencialId = leerCredencialId(deps.body);
  const fila = await deps.obtenerCredencial(credencialId);
  if (!fila) {
    throw new ErrorSolicitudSello("No encontramos esa credencial", 404);
  }
  if (fila.user_id !== deps.userId) {
    throw new ErrorSolicitudSello("Esta credencial no es tuya", 403);
  }

  // Si ya hay sellado_en, ESE instante es el verificado_en del hash.
  // Generar otro cambiaría el sha256 y gastaría ETH de prueba al pedo.
  const verificadoEn = fila.sellado_en
    ? normalizarVerificadoEn(fila.sellado_en)
    : (deps.ahora ?? (() => new Date()))().toISOString();

  const datos = validarDatosSello(
    {
      fuente: fila.fuente,
      badge_id: fila.badge_id,
      titulo: fila.titulo,
      emisor: fila.emisor,
      fecha_emision: fila.fecha_emision,
      estado: fila.estado,
      verificado_en: verificadoEn,
    },
    false,
  );

  const hashEsperado = calcularHashSello(datos);
  const yaGuardado =
    Boolean(fila.sellado_en) &&
    Boolean(fila.tx_hash) &&
    hashesIguales(fila.hash, hashEsperado);

  if (yaGuardado) {
    return cuerpoDe(fila, datos.verificado_en, {
      mensaje: "Esta credencial ya estaba sellada",
      hash: hashEsperado,
      tx_hash: fila.tx_hash,
      block_number: null,
      sellado_en_blockchain: null,
      etherscan_url: null,
      ya_existia: true,
      confirmado: true,
    });
  }

  // Había sello, pero los datos de la fila ya no dan ese hash. No sellamos de nuevo:
  // eso taparía el cambio y gastaría otro sello.
  if (fila.sellado_en && fila.hash && !hashesIguales(fila.hash, hashEsperado)) {
    throw new ErrorSolicitudSello(
      "La credencial ya tenía un sello y los datos ya no coinciden. No se volvió a sellar.",
      409,
    );
  }

  if (!fila.sellado_en) {
    // Fijamos verificado_en ANTES de la transacción. Un reintento (o un doble click)
    // tiene que hashear este mismo string; si no, Sepolia recibe otro sello y se gasta ETH.
    const reserva = await deps.reservarSelladoEn(
      fila.id,
      deps.userId,
      datos.verificado_en,
    );
    if (reserva === "ya_reservado") {
      throw new ErrorSolicitudSello(
        "Ya se está sellando esta credencial. Volvé a intentar en unos segundos.",
        409,
      );
    }
  }

  const resultado = await deps.sellar(datos);

  // Invariante para /api/comprobar: lo que se persiste en sellado_en es el
  // verificado_en del objeto canónico, no sellado_en_blockchain (el bloque).
  if (resultado.datos.verificado_en !== datos.verificado_en) {
    throw new Error(
      "El verificado_en del hash no coincide con el sellado_en que se iba a guardar",
    );
  }

  const guardado: SelloGuardado = {
    hash: resultado.hash,
    tx_hash: resultado.tx_hash ?? fila.tx_hash,
    sellado_en: resultado.datos.verificado_en,
  };
  await deps.guardarSello(fila.id, deps.userId, guardado);

  return cuerpoDe(fila, guardado.sellado_en, {
    mensaje: mensajeDeResultado(resultado),
    hash: guardado.hash,
    tx_hash: guardado.tx_hash,
    block_number: resultado.block_number,
    sellado_en_blockchain: resultado.sellado_en_blockchain,
    etherscan_url: resultado.etherscan_url,
    ya_existia: resultado.ya_existia,
    confirmado: resultado.confirmado,
  });
}
