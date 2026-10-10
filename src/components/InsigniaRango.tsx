export const RANGOS = ["bronce", "plata", "oro", "platino"] as const;

export type Rango = (typeof RANGOS)[number];

const METAL: Record<Rango, { nombre: string; metal: string; tinta: string }> = {
  bronce: { nombre: "Bronce", metal: "#a97142", tinta: "#4a2c14" },
  plata: { nombre: "Plata", metal: "#8d97a1", tinta: "#2c343b" },
  oro: { nombre: "Oro", metal: "#c6a15b", tinta: "#4a3912" },
  platino: { nombre: "Platino", metal: "#6e8b9a", tinta: "#1b2c36" },
};

function Medalla({
  metal,
  tinta,
  tamano,
}: {
  metal: string;
  tinta: string;
  tamano: number;
}) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 64 72" aria-hidden="true">
      <path d="M18 2h10l1 24H20L18 2z" fill={tinta} />
      <path d="M36 2h10l-2 24H34L36 2z" fill={tinta} opacity="0.72" />
      <circle cx="32" cy="46" r="22" fill={metal} />
      <circle cx="32" cy="46" r="15" fill="none" stroke={tinta} strokeWidth="1.7" opacity="0.4" />
      <circle cx="32" cy="46" r="3.5" fill={tinta} />
    </svg>
  );
}

const TAMANOS = {
  sm: { medalla: 28, texto: "text-xs" },
  md: { medalla: 36, texto: "text-sm" },
  lg: { medalla: 56, texto: "text-base" },
} as const;

export function InsigniaRango({
  rango,
  tamano = "md",
}: {
  rango: Rango;
  tamano?: keyof typeof TAMANOS;
}) {
  const meta = METAL[rango];
  const medida = TAMANOS[tamano];

  const apilada = tamano === "lg";

  return (
    <span className={`inline-flex items-center gap-2 ${apilada ? "flex-col text-center" : "gap-2.5"}`}>
      <Medalla metal={meta.metal} tinta={meta.tinta} tamano={medida.medalla} />
      <span className={`font-semibold text-ink ${medida.texto}`}>{meta.nombre}</span>
    </span>
  );
}

export function esRango(valor: string | null | undefined): valor is Rango {
  return RANGOS.some((rango) => rango === valor);
}
