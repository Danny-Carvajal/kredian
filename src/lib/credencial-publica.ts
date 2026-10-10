import { urlEtherscanTx } from "@/lib/blockchain";

/** Fila de `credenciales` que alcanza para mostrar y comprobar un sello. */
export type CredencialVisible = {
  id: string;
  fuente: string | null;
  badge_id: string | null;
  titulo: string | null;
  emisor: string | null;
  fecha_emision: string | null;
  estado: string | null;
  hash: string | null;
  tx_hash: string | null;
  sellado_en: string | null;
  rango: string | null;
};

/**
 * Datos que /api/comprobar usa para recalcular el hash (sección 7).
 * `sellado_en` viaja tal cual está en la tabla: es el `verificado_en` del sello.
 */
export type DatosComprobar = {
  fuente: string;
  badge_id: string;
  titulo: string;
  emisor: string;
  fecha_emision: string;
  estado: string;
  sellado_en: string;
};

const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;

function texto(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const limpio = valor.trim();
  return limpio === "" ? null : limpio;
}

/** Hay sello guardado solo si existe `hash`. `sellado_en` a solas es la reserva previa a la tx. */
export function tieneSello(credencial: { hash: string | null }): boolean {
  return Boolean(credencial.hash?.trim());
}

/** En `/perfil`, el botón Sellar aparece cuando la fila todavía no tiene hash. */
export function debeMostrarBotonSellar(credencial: { hash: string | null }): boolean {
  return !tieneSello(credencial);
}

export function linkTransaccion(txHash: string | null | undefined): string | null {
  if (!txHash?.trim()) return null;
  return urlEtherscanTx(txHash);
}

export function urlFotoSegura(valor: string | null | undefined): string | null {
  if (!valor?.trim()) return null;
  try {
    const url = new URL(valor.trim());
    if (url.protocol === "https:" || url.protocol === "http:") return url.toString();
  } catch {
    return null;
  }
  return null;
}

/**
 * Arma el body de "Comprobar sello". Si falta un campo del hash, devuelve null
 * y el botón manda solo el hash guardado.
 */
export function datosParaComprobar(credencial: CredencialVisible): DatosComprobar | null {
  const fuente = credencial.fuente?.trim();
  const badge_id = credencial.badge_id?.trim();
  const titulo = credencial.titulo?.trim();
  const emisor = credencial.emisor?.trim();
  const estado = credencial.estado?.trim();
  const sellado_en = credencial.sellado_en?.trim();
  const fecha = credencial.fecha_emision?.trim().slice(0, 10) ?? "";

  if (!fuente || !badge_id || !titulo || !emisor || !estado || !sellado_en) return null;
  if (!FECHA_RE.test(fecha)) return null;

  return { fuente, badge_id, titulo, emisor, fecha_emision: fecha, estado, sellado_en };
}

export function mapearCredencial(row: unknown): CredencialVisible | null {
  if (!row || typeof row !== "object") return null;
  const fila = row as Record<string, unknown>;
  if (typeof fila.id !== "string" || fila.id.trim() === "") return null;

  return {
    id: fila.id.trim(),
    fuente: texto(fila.fuente),
    badge_id: texto(fila.badge_id),
    titulo: texto(fila.titulo),
    emisor: texto(fila.emisor),
    fecha_emision: texto(fila.fecha_emision),
    estado: texto(fila.estado),
    hash: texto(fila.hash),
    tx_hash: texto(fila.tx_hash),
    sellado_en: texto(fila.sellado_en),
    rango: texto(fila.rango),
  };
}

export function soloSelladas(filas: CredencialVisible[]): CredencialVisible[] {
  return filas.filter(tieneSello);
}
