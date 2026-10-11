import type { Rango } from "@/components/InsigniaRango";
import { esRango } from "@/components/InsigniaRango";

export type FilaRango = {
  patron: string;
  area: string;
  subarea: string;
  rango: Rango;
  peso: number;
};

/** ~20 certificaciones para sembrar `rangos` y asignar al guardar. */
export const RANGOS_SEMILLA: FilaRango[] = [
  { patron: "introduction to cloud 101", area: "cloud", subarea: "aws", rango: "bronce", peso: 1 },
  { patron: "cloud practitioner", area: "cloud", subarea: "aws", rango: "plata", peso: 2 },
  { patron: "solutions architect associate", area: "cloud", subarea: "aws", rango: "oro", peso: 3 },
  { patron: "solutions architect professional", area: "cloud", subarea: "aws", rango: "platino", peso: 4 },
  { patron: "developer associate", area: "cloud", subarea: "aws", rango: "oro", peso: 3 },
  { patron: "sysops administrator", area: "cloud", subarea: "aws", rango: "oro", peso: 3 },
  { patron: "google cloud digital leader", area: "cloud", subarea: "gcp", rango: "plata", peso: 2 },
  { patron: "associate cloud engineer", area: "cloud", subarea: "gcp", rango: "oro", peso: 3 },
  { patron: "azure fundamentals", area: "cloud", subarea: "azure", rango: "plata", peso: 2 },
  { patron: "azure administrator", area: "cloud", subarea: "azure", rango: "oro", peso: 3 },
  { patron: "introduction to cybersecurity", area: "seguridad", subarea: "cisco", rango: "bronce", peso: 1 },
  { patron: "cybersecurity essentials", area: "seguridad", subarea: "cisco", rango: "plata", peso: 2 },
  { patron: "ccna", area: "redes", subarea: "cisco", rango: "oro", peso: 3 },
  { patron: "security+", area: "seguridad", subarea: "comptia", rango: "oro", peso: 3 },
  { patron: "network+", area: "redes", subarea: "comptia", rango: "plata", peso: 2 },
  { patron: "linux+", area: "sistemas", subarea: "comptia", rango: "plata", peso: 2 },
  { patron: "kubernetes", area: "devops", subarea: "cncf", rango: "oro", peso: 3 },
  { patron: "cka", area: "devops", subarea: "cncf", rango: "platino", peso: 4 },
  { patron: "terraform associate", area: "devops", subarea: "hashicorp", rango: "oro", peso: 3 },
  { patron: "ibm skillsbuild", area: "fundamentos", subarea: "ibm", rango: "bronce", peso: 1 },
];

export function asignarRango(titulo: string | null | undefined): Rango | null {
  if (!titulo?.trim()) return null;
  const hay = titulo
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  let mejor: FilaRango | null = null;
  for (const fila of RANGOS_SEMILLA) {
    if (!hay.includes(fila.patron.replace(/[^a-z0-9+]+/g, " ").trim())) continue;
    if (
      !mejor ||
      fila.patron.length > mejor.patron.length ||
      (fila.patron.length === mejor.patron.length && fila.peso > mejor.peso)
    ) {
      mejor = fila;
    }
  }
  return mejor && esRango(mejor.rango) ? mejor.rango : null;
}
