import ejemplo from "@/data/credly-ejemplo.json";

export type InsigniaCredly = {
  fuente: "credly";
  url: string;
  badge_id: string;
  titulo: string;
  emisor: string;
  nombre_en_insignia: string;
  fecha_emision: string;
  fecha_vencimiento: string | null;
  estado: "vigente" | "vencida" | "revocada";
  plan_b: boolean;
};

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

export function extraerBadgeId(urlCruda: string): string | null {
  let url: URL;
  try {
    url = new URL(urlCruda.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  if (host !== "credly.com") return null;
  const match = url.pathname.match(UUID_RE);
  return match ? match[0].toLowerCase() : null;
}

function fechaDe(valor: unknown): string | null {
  if (typeof valor !== "string" || !valor.trim()) return null;
  const dia = valor.trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(dia) ? dia : null;
}

function texto(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const limpio = valor.trim();
  return limpio === "" ? null : limpio;
}

function estadoDe(expira: string | null): InsigniaCredly["estado"] {
  if (!expira) return "vigente";
  return expira < new Date().toISOString().slice(0, 10) ? "vencida" : "vigente";
}

function desdeObjeto(url: string, badgeId: string, data: Record<string, unknown>): InsigniaCredly | null {
  const badge =
    data.badge && typeof data.badge === "object"
      ? (data.badge as Record<string, unknown>)
      : data;

  const issuerRaw = badge.issuer ?? data.issuer ?? data.issued_by;
  const issuer =
    issuerRaw && typeof issuerRaw === "object"
      ? texto((issuerRaw as Record<string, unknown>).name)
      : texto(issuerRaw);

  const titulo =
    texto(badge.name) ??
    texto(data.name) ??
    texto(badge.title) ??
    texto(data.title);

  const issuedTo = data.issued_to;
  const recipient = data.recipient;
  const nombre =
    texto(data.issued_to_name) ??
    (issuedTo && typeof issuedTo === "object"
      ? texto((issuedTo as Record<string, unknown>).name)
      : texto(issuedTo)) ??
    (recipient && typeof recipient === "object"
      ? texto((recipient as Record<string, unknown>).name)
      : null) ??
    "";

  const emision =
    fechaDe(data.issued_at) ??
    fechaDe(data.issuedOn) ??
    fechaDe(data.issued_on) ??
    fechaDe(badge.issuedOn);

  const vence =
    fechaDe(data.expires_at) ?? fechaDe(data.expires) ?? fechaDe(badge.expires);

  if (!titulo || !issuer || !emision) return null;

  return {
    fuente: "credly",
    url,
    badge_id: badgeId,
    titulo,
    emisor: issuer,
    nombre_en_insignia: nombre,
    fecha_emision: emision,
    fecha_vencimiento: vence,
    estado: estadoDe(vence),
    plan_b: false,
  };
}

function jsonLdDeHtml(html: string): Record<string, unknown>[] {
  const bloques = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  const out: Record<string, unknown>[] = [];
  for (const bloque of bloques) {
    try {
      const parsed = JSON.parse(bloque[1] ?? "") as unknown;
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && typeof item === "object") out.push(item as Record<string, unknown>);
        }
      } else if (parsed && typeof parsed === "object") {
        out.push(parsed as Record<string, unknown>);
      }
    } catch {
      // HTML sucio: seguimos.
    }
  }
  return out;
}

async function fetchJson(url: string, signal: AbortSignal): Promise<Record<string, unknown> | null> {
  const res = await fetch(url, {
    signal,
    headers: {
      Accept: "application/json",
      "User-Agent": "Kredian/0.1 (verificador de insignias; proyecto universitario)",
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json().catch(() => null)) as unknown;
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  if (obj.data && typeof obj.data === "object") return obj.data as Record<string, unknown>;
  return obj;
}

function insigniaPlanB(url: string, badgeId: string | null): InsigniaCredly {
  return {
    fuente: "credly",
    url,
    badge_id: badgeId ?? ejemplo.badge_id,
    titulo: ejemplo.titulo,
    emisor: ejemplo.emisor,
    nombre_en_insignia: ejemplo.nombre_en_insignia,
    fecha_emision: ejemplo.fecha_emision,
    fecha_vencimiento: ejemplo.fecha_vencimiento,
    estado: "vigente",
    plan_b: true,
  };
}

export async function leerInsigniaCredly(urlCruda: string): Promise<InsigniaCredly> {
  const url = urlCruda.trim();
  const badgeId = extraerBadgeId(url);
  if (!badgeId && !url.toLowerCase().includes("credly.com")) {
    throw new Error("Pegá un link público de Credly (credly.com/badges/...).");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    if (badgeId) {
      const endpoints = [
        `https://www.credly.com/api/v1/public_badges/${badgeId}`,
        `https://www.credly.com/badges/${badgeId}.json`,
        `https://www.credly.com/api/v1/obi/v2/issuance/${badgeId}`,
      ];
      for (const endpoint of endpoints) {
        const data = await fetchJson(endpoint, controller.signal);
        if (!data) continue;
        const insignia = desdeObjeto(url, badgeId, data);
        if (insignia) return insignia;
      }

      const htmlRes = await fetch(`https://www.credly.com/badges/${badgeId}/public_url`, {
        signal: controller.signal,
        headers: {
          Accept: "text/html",
          "User-Agent": "Kredian/0.1 (verificador de insignias; proyecto universitario)",
        },
        cache: "no-store",
      });
      if (htmlRes.ok) {
        const html = await htmlRes.text();
        for (const nodo of jsonLdDeHtml(html)) {
          const credential = nodo.credentialSubject as Record<string, unknown> | undefined;
          const insignia = desdeObjeto(url, badgeId, {
            ...nodo,
            name: nodo.name ?? credential?.name,
            issued_to_name:
              texto(nodo.recipient?.toString()) ??
              (credential ? texto(credential.name) : null),
            issuer: nodo.issuer,
            issuedOn: nodo.validFrom ?? nodo.datePublished,
          });
          if (insignia) return insignia;
        }
      }
    }
  } catch {
    // Plan B: JSON de ejemplo (sección 10).
  } finally {
    clearTimeout(timer);
  }

  return insigniaPlanB(url, badgeId);
}
