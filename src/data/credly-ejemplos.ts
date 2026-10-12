export type EjemploCredly = {
  badge_id: string;
  titulo: string;
  emisor: string;
  nombre_en_insignia: string;
  fecha_emision: string;
  fecha_vencimiento: string | null;
  estado: "vigente";
  url: string;
};

export const EJEMPLOS_CREDLY: EjemploCredly[] = [
  {
    badge_id: "plan-b-aws-educate-cloud-101",
    titulo: "AWS Educate Introduction to Cloud 101",
    emisor: "Amazon Web Services",
    nombre_en_insignia: "Danny Carvajal",
    fecha_emision: "2026-03-12",
    fecha_vencimiento: null,
    estado: "vigente",
    url: "https://www.credly.com/badges/plan-b-aws-educate-cloud-101/public_url",
  },
  {
    badge_id: "plan-b-aws-cloud-practitioner",
    titulo: "AWS Certified Cloud Practitioner",
    emisor: "Amazon Web Services",
    nombre_en_insignia: "Danny Carvajal",
    fecha_emision: "2026-06-02",
    fecha_vencimiento: null,
    estado: "vigente",
    url: "https://www.credly.com/badges/plan-b-aws-cloud-practitioner/public_url",
  },
  {
    badge_id: "plan-b-comptia-security-plus",
    titulo: "CompTIA Security+",
    emisor: "CompTIA",
    nombre_en_insignia: "Danny Carvajal",
    fecha_emision: "2026-08-20",
    fecha_vencimiento: null,
    estado: "vigente",
    url: "https://www.credly.com/badges/plan-b-comptia-security-plus/public_url",
  },
];

export function ejemploPorUrl(url: string, badgeId: string | null): EjemploCredly {
  const hay = url.toLowerCase();
  const porSlug = EJEMPLOS_CREDLY.find(
    (e) => hay.includes(e.badge_id) || badgeId === e.badge_id,
  );
  return porSlug ?? EJEMPLOS_CREDLY[0];
}
